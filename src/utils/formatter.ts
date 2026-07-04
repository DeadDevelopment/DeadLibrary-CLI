import prettier from 'prettier';
import * as phpPlugin from '@prettier/plugin-php';
import * as javaPlugin from 'prettier-plugin-java';
import { format as formatGo } from '@wasm-fmt/gofmt';
import { execSync } from 'child_process';

export function formatWithSystemTool(filePath: string, language: string): boolean {
  try {
    switch (language) {
      case 'csharp':
        execSync(`dotnet format --include "${filePath}"`, { stdio: 'inherit' });
        return true;
      case 'rust':
        execSync(`rustfmt "${filePath}"`, { stdio: 'inherit' });
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

const extensionMap: Record<string, string> = {
  ts: '.ts',
  js: '.js',
  py: '.py',
  go: '.go',
  java: '.java',
  csharp: '.cs',
  rust: '.rs',
  php: '.php',
};

const testExtensionMap: Record<string, string> = {
  ts: '.spec.ts',
  js: '.spec.js',
  py: '_test.py',
  go: '_test.go',
  java: 'Test.java',
  csharp: 'Tests.cs',
  rust: '_test.rs',
  php: 'Test.php',
};

function getPrettierParser(language: string): string | null {
  switch (language) {
    case 'ts': return 'typescript';
    case 'js': return 'babel';
    case 'php': return 'php';
    case 'java': return 'java';
    case 'rust': return null;
    case 'py': return null;
    case 'go': return null;
    case 'csharp': return null;
    default: return null;
  }
}

export function getFileExtension(language: string, isTest: boolean): string {
  if (isTest) return testExtensionMap[language] ?? '.spec.ts';
  return extensionMap[language] ?? '.ts';
}

export async function formatWithParser(
  content: string,
  parser: prettier.BuiltInParserName | string,
  plugins: any[] = [],
): Promise<string> {
  try {
    const formatted = await prettier.format(content, {
      parser,
      plugins,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      printWidth: 100,
      bracketSpacing: true,
      arrowParens: 'always',
      ...(parser === 'html' ? { htmlWhitespaceSensitivity: 'ignore' as const } : {}),
    });
    return formatted;
  } catch (error) {
    console.error(`Prettier formatting failed for parser "${parser}": `, error);
    return content;
  }
}

export async function formatContent(content: string, language: string): Promise<string> {
  if (language === 'go') {
    try {
      const formatted = formatGo(content);
      return formatted;
    } catch (error) {
      console.error('Go formatting failed:', error);
      return content;
    }
  }
  
  const parser = getPrettierParser(language);
  if (!parser) return content;

  const plugins = [];
  if (parser === 'php') plugins.push(phpPlugin);
  if (parser === 'java') plugins.push(javaPlugin);

  return formatWithParser(content, parser, plugins);
}