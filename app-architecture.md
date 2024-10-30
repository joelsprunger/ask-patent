# Ask Patents App Architecture

## Overview

Ask Patents is a web app that allows users to upload patents, ask questions about the patents, search patents for inventions matching a description, and suggest additional inventions based on a patent.

## Architecture

The app is built with Next.js and Tailwind. It uses a serverless architecture with Vercel and Supabase for the database and authentication. Langchain is used for LLM calls. S3 is used for file storage.

## Data

The app uses a Postgres database to store the patents and the user's questions and answers.

Patents are parsed from PDF files using a custom parser. The text is split into the sections:

- abstract
- description
- claims
- figures

### patents

- patent_id (uuid)
- patent_number (string)
- title (string)
- inventors (string)
- date (date)
- file_sha256 (string)

### patent_sections

- patent_section_id (uuid)
- patent_id (uuid) foreign key to patents
- patent_number (string)
- title (string)
- inventors (string)
- date (date)
- section_type (string)
- text (text)
- url (string) link to pdf or images

There is also a table for chunks of text from the patents, which is used for the semantic search. The chunks table has the following columns:

### patent_chunks

- patent_chunk_id (uuid)
- patent_section_id (uuid) foreign key to patent_sections
- section (abstract, description, claims)
- text
- embedding (vector)

Finally, there is a table for images for semantic search. Images will be embedded with a different dimension, so it is stored in a different table: patent_images with the following columns:

### patent_images

- patent_image_id (uuid)
- patent_section_id (uuid) foreign key to patent_sections
- url (string) link to the image in S3
- description (string) text description or caption of the image
- embedding (vector)

Deleting a patent deletes the patent and all of its sections and chunks via a cascade delete.

### chat_history

- chat_history_id (uuid)
- user_id (uuid) foreign key to supabase users cascade delete
- created_at (timestamp)
- selected_patents (string) comma-separated list of patent numbers

### chat_messages

- chat_message_id (uuid)
- chat_history_id (uuid) foreign key to chat_history cascade delete
- message (text)
- role (string) // e.g., 'user', 'assistant', 'moderator'

## UX

Login is done with Google OAuth through Supabase.

Nav bar on the left with the following tabs:

- Browse (search for patents by patent number, keyword, inventor, etc.)
- Chat (chat with a patent or multiple patents)
- Upload (upload a patent)
- Settings (user settings and preferences)

## Browse

Starts as a list of all the patents with columns for search order, patent number, title, inventors, and the first 128 characters of the abstract. There are sort buttons for each column. Initially search order will be blank and default sort is by title.

There is a text search box to use AI to search and rank the patents.

Search is done using a retriever from Langchain. The UI will provide the option to search one or more sections. The retriever will be a weighted combination of a vectorstore as retriever and a BM25 retriever. The weight will be a tunable parameter in the user settings. The vectorstore will be initialized with the chunks table. Results will be sorted by the score from the retriever, but since there are multiple chunks for each patent, duplicates will be removed. When you select a patent, the first 500 characters of the abstract will be displayed below the search results. To the right of the text, there will be 3 similar patents listed by title. These will be semantic search results between the chunks of the selected patent and the chunks of all the patents, with the scores from consecutive duplicates added together.

After hitting search the search order will be updated to the search results. And the sort will be changed to the search order.

When you are viewing the patent browse/\[patent_number\], you will have a button to Chat with this patent. This will open a chat window with the patent selected.

When the user has no patents, there will be a button to redirect to the upload page.

## Chat

On the chat page, there will be a text entry where you can enter patent numbers separated by commas, but you don't have to type a patent number. As you type, the search function will be called and suggest the top 3 patents with the titles and the first 10 words of the abstract shown. You will be able to tab select the suggested patents, which will be added to the text list. If the list is left empty or \*, then the chat will be with all patents.

Tools:

Chat will have the use of some additional tools other than just a Patent Retriever.

### Patent Infringement tool

There will be a tool to find similar patents, then batch process the top 10 patents with a prompt to determine if the invention already exists (yes/no/maybe). If yes/maybe, it will check the invention against all the claims of each patent and return the results. An agent will be used to determine if the patent-infringement tool should be used.

### Summary tool

This tool will return a summary of the patent. The agent will determine if the summary is needed to answer the question.

### Conversation Summary tool

This tool will return a summary of the conversation. The agent will determine if the summary is needed to answer the question. This tool may also be called to generate a title for the conversation if the conversation changes.

## Upload

The upload page has a file input for the patent PDF. There is a submit button to upload the patent. When the patent is uploaded, the page will refresh and the new patent will be listed on the browse page. The patent will be parsed and the data stored in the database.

Upload will compute the sha256 for the file and check if the patent already exists in the database. If it does, the patent will be updated. If it does not, the patent will be added to the database.

## Settings

TODO
