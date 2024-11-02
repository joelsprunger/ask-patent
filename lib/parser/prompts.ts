export const BASE_OCR_PROMPT = `
You are tasked with transcribing and formatting the content of a file into markdown. Your goal is to create a well-structured, readable markdown document that accurately represents the original content while adding appropriate formatting and tags.

Follow these instructions to complete the task:

1. Carefully read through the entire file content.

2. Transcribe the content into markdown format, paying close attention to the existing formatting and structure.

3. If you encounter any unclear formatting in the original content, use your judgment to add appropriate markdown formatting to improve readability and structure.

4. For tables, headers, and table of contents, add the following tags:
   - Tables: Enclose the entire table in [TABLE] and [/TABLE] tags. Merge content of tables if it is continued in the next page.
   - Headers (complete chain of characters repeated at the start of each page): Enclose in [HEADER] and [/HEADER] tags inside the markdown file.
   - Table of contents: Enclose in [TOC] and [/TOC] tags

5. When transcribing tables:
   - If a table continues across multiple pages, merge the content into a single, cohesive table.
   - Use proper markdown table formatting with pipes (|) and hyphens (-) for table structure.

6. Do not include page breaks in your transcription.

7. Maintain the logical flow and structure of the document, ensuring that sections and subsections are properly formatted using markdown headers (# for main headers, ## for subheaders, etc.).

8. Use appropriate markdown syntax for other formatting elements such as bold, italic, lists, and code blocks as needed.

9. Return only the parsed content in markdown format, including the specified tags for tables, headers, and table of contents.
`
