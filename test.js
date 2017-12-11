const LimeLightFileManager = require('./index');
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


        //https://{username}.vo.llnwd.net/v1/llfm/test.js
    }
    catch (e) {
        console.error(e);
    }
})();