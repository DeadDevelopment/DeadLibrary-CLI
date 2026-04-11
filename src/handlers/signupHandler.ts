import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import prompts from 'prompts';
import { ui } from '../utils/ui';
import { firebaseConfig } from '../utils/shared';

export async function signupHandler(options: {
  email?: string,
  password?: string,
  username?: string,
  company?: string,
}) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const functions = getFunctions(app, 'us-central1');

  let {email, password, username, company} = options;

  // run prompt if opts not present
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

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // create firebase auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const refreshToken = userCredential.user.refreshToken;

    // Provision firestore user doc w/ cf
    const createWebUser = httpsCallable(functions, 'createWebUser');
    await createWebUser({ email, username: username || '', company: company || '' });

    // save auth config
    const authConfig = {
      profiles: {
        default: {
          projectId: firebaseConfig.projectId,
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

    console.log(ui.ok('Account created successfully!'));
    console.log(ui.label('You can now use `dead demo` to try DeadLibrary with gl, fg, and theme commands.'));
    console.log(ui.label('When you\'re ready for full access, run `dead subscribe` to start your 7-day free trial.'));

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Use `dead login` instead.');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    throw new Error(`Signup failed: ${error.message}`);
  }
}