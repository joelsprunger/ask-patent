export enum TagEnum {
  TABLE = "TABLE",
  TOC = "TOC",
  HEADER = "HEADER",
  IMAGE = "IMAGE"
}

export interface ParserOptions {
  model: string
  batchSize?: number
}

export interface ParsedResult {
  content: string
  chunks?: string[]
}
