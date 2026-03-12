// ノート種別
export type NoteType = 'fleeting' | 'literature' | 'permanent' | 'index';

// 出典タグエンティティ
export interface SourceTag {
  id: string;
  key: string;
  value: string;
  createdAt: string; // ISO 8601
}

// Fleeting Note → Literature / Permanent 昇格入力
export interface PromoteInput {
  /** 書き直し後の本文（省略時は元の Fleeting Note 本文を引き継ぐ） */
  content?: string;
  /** 新しいタイトル（省略時は元のタイトルを引き継ぐ） */
  title?: string;
  /** Literature Note 用: "@key:value" 形式の出典タグ文字列配列 */
  sourceTagTexts?: string[];
  /** Permanent Note 用: 親 Folgezettel ID（現フェーズでは null 固定） */
  parentFolgezettelId?: string | null;
}

// ノートエンティティ
export interface Note {
  id: string;
  folgezettelId: string | null;
  type: NoteType;
  title: string;
  content: string;
  sourceTagIds: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  processedAt: string | null;
}

// リンクエンティティ
export interface Link {
  id: string;
  fromNoteId: string;
  toNoteId: string;
  createdAt: string;
}

// ノート作成入力
export interface CreateNoteInput {
  type: NoteType;
  content: string;
  title?: string;
  sourceTagIds?: string[];
  parentFolgezettelId?: string | null;
}

// バリデーション結果
export interface ValidationError {
  field: string;
  message: string;
  suggestion: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// IPC レスポンス共通型
export interface IPCResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
