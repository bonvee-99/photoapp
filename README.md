# photoapp

A better personal bereal

### API

Images are stored in local storage <photos>. We use metadata.json for storing ids of saved images.

##### To start server:
```bash
npm run dev
```

##### For basic file upload and get test run:

```bash
# upload image
curl -X POST http://localhost:5000/photos \
 -F "photo=@./mcdavo.jpg"
```

```bash
# retrieve image
curl http://localhost:5000/photos/{id} --output retrieved_image.jpg
```
