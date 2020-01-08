# alexa-awesome-quotations
Alexa Skill for awesome quotations

## TODOs
- use AMAZON.Person slot type
- add table name to model in db.js "tableName: 'awesomeQuotations-authors',"
  and copy data using https://github.com/bchew/dynamodump
- add proper IAM role to only allow access to this table, not all of DynamoDB, check dayCounter
- add synonym "Theodor Seuss Geisel" for Dr. Seuss
- Checking log files, voice recognition may fail for
  * Louis C.K. (en)
  * Dr. Seuss (en)
  * François de La Rochefoucauld (en), might need normalization for "c" in first name