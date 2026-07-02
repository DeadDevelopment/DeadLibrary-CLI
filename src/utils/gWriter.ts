// src/utils/gWriter.ts
import { promises as fs } from 'fs'
import * as path from 'path'
import prettier from 'prettier';
import { formatContent, formatWithSystemTool, getFileExtension } from './formatter'
import { ui } from './ui'
import { sanitizeCodeString } from './utils'
import { createHash } from 'crypto';
import prompts from 'prompts';

// NEW
interface MacroFile {
  name: string,
  content: string,
  type?: 'logic' | 'template' | 'styles' | 'test'
}

interface MacroWriteInstructions {
  mode: 'macro',
  outputDir: string,
  baseName: string,
  files: MacroFile[],
  raw: string
}

interface AtomicFile {
  content: string,
  type: 'logic' | 'test'
}

interface AtomicWriteInstructions {
  mode: 'atomic',
  files: AtomicFile[],
  commandName: string,
  language: string,
  raw: string
}

interface AtomicWriteOptions {
  fileName?: string,
  path: string,
  commandOrder?: number,
  line?: number,
  column?: number
}

interface ManifestEntry {
  raw: string,
  position: number,
  fragment: string
}

interface FileManifest {
  filePath: string,
  hash: string,
  entries: ManifestEntry[]
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function getManifestPath(filePath: string): string {
  const sanitized = filePath.replace(/[/\\]/g, '__');
  return path.join('.dead', 'manifests', `${sanitized}.json`);
}

function getDeadCommandPath(filePath: string): string {
  const sanitized = filePath.replace(/[/\\]/g, '__');
  return path.join('.dead', 'commands', `${sanitized}.cmds`);
}

async function readManifest(manifestPath: string): Promise<FileManifest | null> {
  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function writeManifest(manifestPath: string, manifest: FileManifest): Promise<void> {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

async function writeDeadCommandFile(cmdsFilePath: string, entries: ManifestEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(cmdsFilePath), { recursive: true });
  const content = entries
    .sort((a, b) => a.position - b.position)
    .map((e) => e.raw)
    .join('\n');
  await fs.writeFile(cmdsFilePath, content, 'utf8');
}

export async function writeMacroFiles(instructions: MacroWriteInstructions): Promise<void> {
  if (typeof global !== 'undefined' && (global as any).__disableFileWrites__) {
    if (typeof global !== 'undefined') {
      (global as any).__writeInstructions__ = instructions
    }
    console.log(ui.warn('[DeadLibrary CLI][TEST] File writes disabled by global.__disableFileWrites__'))
    return
  }

  const { outputDir = './generated', baseName, files, raw } = instructions;
  const containerDir = path.join(outputDir, baseName);

  await fs.mkdir(containerDir, { recursive: true });

  for (const file of files) {
    const filePath = path.join(containerDir, file.name);

    let fileType = file.type;
    if (!fileType) {
      if (file.name.endsWith('.spec.ts')) fileType = 'test'
      else if (file.name.endsWith('.ts')) fileType = 'logic'
      else if (file.name.endsWith('.html')) fileType = 'template'
      else if (file.name.endsWith('.scss') || file.name.endsWith('.css')) fileType = 'styles'
    }

    let cleanContent = sanitizeCodeString(file.content);

    let parserType: prettier.BuiltInParserName | undefined;
    if (fileType === 'logic' || fileType === 'test') parserType = 'typescript'
    else if (fileType === 'template') parserType = 'html'
    else if (fileType === 'styles') parserType = 'scss';

    if (parserType) {
      cleanContent = await formatContent(cleanContent, parserType);
    }

    await fs.writeFile(filePath, cleanContent, 'utf8');
    const bytes = Buffer.byteLength(cleanContent, 'utf8');
    console.log(`${ui.dim('write: ')} ${ui.label(filePath)} ${ui.dim(`(${bytes} B)`)}`);

    // create manifest for each output file
    const manifestPath = getManifestPath(filePath);
    const deadCmdsFilePath = getDeadCommandPath(filePath);
    
    const newManifest: FileManifest = {
      filePath,
      hash: hashContent(cleanContent),
      entries: [{
        raw,
        position: 0,
        fragment: cleanContent
      }]
    };

    await writeManifest(manifestPath, newManifest);
    await writeDeadCommandFile(deadCmdsFilePath, newManifest.entries);
  }
}

export async function writeAtomicFiles(instructions: AtomicWriteInstructions, options: AtomicWriteOptions): Promise<void> {
  if (typeof global !== 'undefined' && (global as any).__disableFileWrites__) {
    if (typeof global !== 'undefined') {
      (global as any).__writeInstructions__ = { instructions, options }
    }
    console.log(ui.warn('[DeadLibrary CLI][TEST] File writes disabled by global.__disableFileWrites__'))
    return
  }

  if (!options.fileName) {
    console.error(ui.err('--fileName is required artifact commands.'));
    return
  }

  for (const file of instructions.files) {
    const suffix = getFileExtension(instructions.language, file.type === 'test');
    const targetFileName = options.fileName.endsWith(suffix) ? options.fileName : options.fileName + suffix;
    const targetPath = path.join(options.path, targetFileName);
    const manifestPath = getManifestPath(targetPath);
    const deadCmdsFilePath = getDeadCommandPath(targetPath);

    const sanitizedFragment = sanitizeCodeString(file.content, instructions.language);

    const manifest = await readManifest(manifestPath);

    if (manifest) {
      // existing file: check hash for edits outside of a command based changes
      try {
        const currentContent = await fs.readFile(targetPath, 'utf8');
        const currentHash = hashContent(currentContent);
        if (currentHash !== manifest.hash) {
          console.log(ui.warn(`File ${targetPath} has been modified outside of DeadLibrary.`));
          
          const { proceed } = await prompts({
            type: 'confirm',
            name: 'proceed',
            message: 'This file contains changes made outside of DeadLibrary commands. Proceeding will rebuild the file from its command history, which will erase those changes. Continue?',
            initial: false
          });

          if (!proceed) {
            console.log(ui.label('Command cancelled. File unchanged.'));
            return;
          }
        }
      } catch {
        // file doesn't exist on disk despite having a manifest. Rebuild it
        console.log(ui.warn(`Manifest exists but ${targetPath} not found on disk. Rebuilding.`));
        if (options.line !== undefined) {
          console.error(ui.err(`Cannot inject at line/column. File ${targetPath} does not exist.`));
          return;
        }
      }

      // line/column injection: insert into file as-is
      if (options.line !== undefined) {
        const currentContent = await fs.readFile(targetPath, 'utf8');
        const lines = currentContent.split('\n');
        const lineIndex = options.line - 1;
        const col = options.column ?? 0;

        if (lineIndex < 0 || lineIndex > lines.length) {
          console.error(ui.err(`Line ${options.line} is greater than file lines value. File has ${lines.length} lines.`));
          return;
        }

        const targetLine = lines[lineIndex] ?? '';
        lines[lineIndex] = targetLine.slice(0, col) + sanitizedFragment + targetLine.slice(col);

        const assembled = lines.join('\n');
        let formatted = await formatContent(assembled, instructions.language);

        await fs.writeFile(targetPath, formatted, 'utf8');

        if (formatWithSystemTool(targetPath, instructions.language)) {
          formatted = await fs.readFile(targetPath, 'utf8');
        }

        // increment positions of existing entries at or after insertion
        for (const entry of manifest.entries) {
          if (entry.position >= options.commandOrder!) {
            entry.position++;
          }
        }

        manifest.entries.push({
          raw: instructions.raw,
          position: options.commandOrder!,
          fragment: sanitizedFragment
        });

        manifest.hash = hashContent(formatted);
        await writeManifest(manifestPath, manifest);
        await writeDeadCommandFile(deadCmdsFilePath, manifest.entries);

        const bytes = Buffer.byteLength(formatted, 'utf8');
        console.log(`${ui.dim('write: ')} ${ui.label(targetPath)} ${ui.dim(`(${bytes} B)`)}`);
        return;
      }

      // Insert at position or append
      const position = options.commandOrder ?? manifest.entries.length;

      // Increment positions of entries at or after the insertion point.
      for (const entry of manifest.entries) {
        if (entry.position >= position) {
          entry.position++;
        }
      }

      manifest.entries.push({
        raw: instructions.raw,
        position,
        fragment: sanitizedFragment,
      });

      // reassemble from all fragments in order
      const assembled = manifest.entries
        .sort((a, b) => a.position - b.position)
        .map((e) => e.fragment)
        .join('\n');

      let formatted = await formatContent(assembled, instructions.language);

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, formatted, 'utf8');

      if (formatWithSystemTool(targetPath, instructions.language)) {
        formatted = await fs.readFile(targetPath, 'utf8');
      }

      manifest.hash = hashContent(formatted);

      manifest.filePath = targetPath;

      await writeManifest(manifestPath, manifest);
      await writeDeadCommandFile(deadCmdsFilePath, manifest.entries);

      const bytes = Buffer.byteLength(formatted, 'utf8');
      console.log(`${ui.dim('write: ')} ${ui.label(targetPath)} ${ui.dim(`(${bytes} B)`)}`);

    } else {
      // New file: create everything fresh (for first artifact command entered)
      let formatted = await formatContent(sanitizedFragment, instructions.language);

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, formatted, 'utf8');

      if (formatWithSystemTool(targetPath, instructions.language)) {
        formatted = await fs.readFile(targetPath, 'utf8');
      }

      const newManifest: FileManifest = {
        filePath: targetPath,
        hash: hashContent(formatted),
        entries: [{
          raw: instructions.raw,
          position: 0,
          fragment: sanitizedFragment
        }]
      };

      await writeManifest(manifestPath, newManifest);
      await writeDeadCommandFile(deadCmdsFilePath, newManifest.entries);

      const bytes = Buffer.byteLength(formatted, 'utf8');
      console.log(`${ui.dim('write: ')} ${ui.label(targetPath)} ${ui.dim(`(${bytes} B)`)}`);
    }
  }
}
