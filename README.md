# typeql

Easier way to provide typings for your graphql queries.

# How to use

- Convert your graphql queries to typeql. Its really simple just take a look
  inside the tql folder. **Note: Remember to seperate your query into multi line
  or you get wrong output**
- Put files inside tql folder with .tql extension
- `npm run start`
- Get .graphql files in root folder

# Known Problems

- Delete typings folder to remove typings/query...ts not under rootDir.
- You have to use multiline queries to get the correct typings/graphql-query
  from your typeql file.
