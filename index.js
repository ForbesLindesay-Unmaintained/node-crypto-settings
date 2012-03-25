var fs = require("fs"),
    crypto = require("crypto");
function load(password, optionsOrCallback, callback){
    var options = {},
        isAsync = false;
    if(typeof optionsOrCallback === "function"){
        callback = optionsOrCallback;
    }else if(optionsOrCallback){
        options = optionsOrCallback;
    }
    if(typeof callback === "function"){
        isAsync = true;
    }
    options = options || {};
    password = password || "";
    function decode(data){
        if(data){
            var decipher = crypto.createDecipher("aes256", password);
            var decrypted = decipher.update(data, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return JSON.parse(decrypted);
        } else {
            return {};
        }
    }
    function encode(data){
        var cipher = crypto.createCipher("aes256", password);
        var encrypted = cipher.update(new Buffer(JSON.stringify(data)), 'binary', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }
    if(isAsync){
        options.read = options.read || function (callback){
            require('path').exists('settings.dat', function(exists){
                if(exists){
                    fs.readFile('settings.dat', 'utf8', function (err, data){
                        if(err) throw err;
                        callback(data);
                    });
                }else{
                    callback(false);
                }
            });
        };
        options.write = options.write || function (data, callback){
            fs.writeFile('settings.dat', data, 'utf8', callback); 
        };
        options.read(function (data){
            var settings = decode(data);
            settings.save = function (callback){
                if(!callback){
                    console.log("saving...");
                    callback = function(err){if(err)throw err;else console.log("saved");};
                }
                options.write(encode(this), callback);
            };
            settings.useConsole = function(){ 
                require("repl").start("> ").context.settings = this;
            };
            callback(settings);
        });
    }else{
        options.readSync = options.readSync || function (){
            if(require('path').existsSync('settings.dat'))
                return fs.readFileSync('settings.dat', 'utf8');
            else
                return false;
        };
        options.writeSync = options.writeSync || function (data){ 
            fs.writeFileSync('settings.dat', data, 'utf8'); 
        };
        return (function(){
            var settings = decode(options.readSync());
            settings.save = function(){ 
                return options.writeSync(encode(this));
            };
            settings.useConsole = function(){ 
                require("repl").start("> ").context.settings = this;
            };
            return settings;
        }());
    }
}
load("password", function(settings){
    console.log(settings);
});
//require("repl").start("> ").context.load = load;
