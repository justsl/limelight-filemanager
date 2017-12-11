# limelight-filemanager
LimeLight nodejs library for publishing files


```
const LimeLightFileManager = require('limelight-filemanager');
const fs = require('fs');

var llfm = new LimeLightFileManager({
    username: '',
    password: '',
    api: 'https://{username}.upload.llnw.net/',
    //subdir: '/llfm'
});

(async function () {
    try {
        var login = await llfm.login();
        console.log(login);


        var uploaded = await llfm.upload({
            body: fs.readFileSync('test.js'),
            path: 'llfm/test.js'
        });
        console.log(uploaded);


        var list = await llfm.list('llfm/');
        console.log(list);

/*
        var deleted = await llfm.delete('llfm/test.js');
        console.log(deleted);*/
    }
    catch (e) {
        console.error(e);
    }
})();
```