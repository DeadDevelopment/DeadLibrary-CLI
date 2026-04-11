import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import prompts from 'prompts';
import { ui } from '../utils/ui';
import { firebaseConfig } from '../utils/shared';

export async function loginHandler(options: { email?: string; password?: string }) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  let email = options.email;
  let password = options.password;
  
  // Prompt for missing credentials
  if (!email || !password) {
    const questions: prompts.PromptObject[] = [];
    
    if (!email) {
      questions.push({
        type: 'text' as const,
        name: 'email',
        message: 'Email address:'
      });
    }
    
    if (!password) {
      questions.push({
        type: 'password' as const,
        name: 'password', 
        message: 'Password:'
      });
    }
    
    const response = await prompts(questions);
    email = email || response.email;
    password = password || response.password;
  }
  
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const refreshToken = userCredential.user.refreshToken;
    
    // Save auth config...
    const authConfig = {
      profiles: {
        default: {
          projectId: "deadlibrary-53c38",
          webApiKey: firebaseConfig.apiKey,
          refreshToken: refreshToken
        }
      },
      current: "default"
    };
    
    const deadDir = path.join(os.homedir(), '.dead');
    await fs.mkdir(deadDir, { recursive: true });
    await fs.writeFile(
      path.join(deadDir, 'auth.json'),
      JSON.stringify(authConfig, null, 2)
    );
    
    console.log(ui.ok('Login successful! You can now use DeadLibrary CLI.'));
    
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}