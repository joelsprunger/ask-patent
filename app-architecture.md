# Ask Patents App Architecture

## Overview

Ask Patents is a web app that allows users to upload pattents, and then ask question about the patents search patents for inventions matching a description, and suggest additional inventions based on a patent.

## Architecture

The app is built with Next.js and Tailwind. It uses a serverless architecture with Vercel.

## Data

The app uses a Postgres database to store the patents and the user's questions and answers.

Patents are parsed from PDF files using a custom parser. And the text is split into the sections

- abstract
- description
- claims
- figures

Patent data is stored in a patents table with the following columns

- patent_id (uuid)
- patent_number (string)
- title (string)
- inventors (string)
- date (date)

Sections are stored in a table: patent_sections with the following columns

- patent_section_id (uuid)
- patent_id (uuid) foreign key to patents
- patent_number (string)
- title (string)
- inventors (string)
- date (date)
- section_type (string)
- text (text)
- url (string) link to pdf or images

There is also a table for chunks of text from the patents, which is used for the semantic search. The chunks table has the following columns

- patent_chunk_id (uuid)
- patent_section_id (uuid) foreign key to patent_sections
- section (abstract, description, claims)
- text
- embedding (vector)

Finally there is a table for images for semantic search. Images will be embedded with a different dimension so it is stored in a different table: patent_images with the following columns

- patent_image_id (uuid)
- patent_section_id (uuid) foreign key to patent_sections
- url (string) link to the image in S3
- description (string) text description or caption of the image
- embedding (vector)

Deleting a patent deletes the patent and all of its sections and chunks via a cascade delete.
