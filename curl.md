curl -i -F "image=@/private/var/tmp/test.jpg" "http://localhost:4000/upload-kyc-image?filename=foo" 

Note that the image=<path> is the manditory part of this "image" needs to match whats being passed to middleware at line 58 in index.js a-la:

app.post('/upload-kyc-image', upload.single('image'), uploadImage)