export enum CaseStatus {
  Success = 'success',
  Fail = 'fail',
}

export interface TestCase {
  id: string;
  title: string;
  status: CaseStatus;
  prompt: string;
  code: string;
  previewHtml: string; // This stores the HTML content for the iframe
}

export interface TestGroup {
  id: string;
  title: string;
  cases: TestCase[];
}

export interface Stats {
  total: number;
  success: number;
  groups: number;
}

export type ModalType = 'upload' | 'viewer' | 'delete' | null;

export interface ViewerData {
  type: 'code' | 'preview' | 'prompt';
  title: string;
  content: string;
}