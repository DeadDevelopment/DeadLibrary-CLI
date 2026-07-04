import { ui } from "./ui";

export const firebaseConfig = {
  apiKey: "AIzaSyAUcSW-cPMiM3_iwhTEnDyEQCVo-9MhEzM",
  authDomain: "deadlibrary-53c38.firebaseapp.com",
  projectId: "deadlibrary-53c38",
};

export function renderApiError(data: any) {
  if (data?.error === 'validation' && Array.isArray(data.issues)) {
    console.error(ui.err(`${data.issues.length} validation error(s):`));
    for (const issue of data.issues) {
      console.error(`  ${issue.path || '(command)'}: ${issue.message}`);
    }
    return;
  }
  if (data?.message) {
    console.error(ui.err(data.message));
    return;
  }
  console.error(ui.err('Command failed.'));
}
