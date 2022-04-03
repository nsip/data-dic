# esa-data-dic

ESA Data dictionary

## For Dev

0. Install nodejs, mongodb & golang on your local machine.

1. Get project from `github.com/nsip/data-dic`, jump into `data-dic`, then `npm update`.

2. Preprocess original json data to make sure there are no errors before ingestion.

    Step 1: put original json files into `data-dic/data/`.

    Step 2: goto `data-dic/data/preproc`, then run `go run .`. Processed files all dumped into `data-dic/data/preproc/out`.  

3. Ingest data to mongodb.

    Step: goto `data-dic/db`, then run `node db-ingest.js`

4. Run service.

    Step: goto `data-dic/`, then run `node server.js`

5. Open Browser.

    Step: open `localhost:3000`, have fun.

## For User

Soon

## For API User

Soon
