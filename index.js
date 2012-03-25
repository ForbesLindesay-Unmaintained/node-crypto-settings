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
            require('path').exists('settings.json', function(exists){
                if(exists){
                    fs.readFile('settings.json', 'utf8', function (err, data){
                        if(err) throw err;
                        callback(data);
                    });
                }else{
                    callback(false);
                }
            });
        };
        options.write = options.write || function (data, callback){
            fs.writeFile('settings.json', data, 'utf8', callback); 
        };
        options.read(function (data){
            var settings = decode(data);
            settings.save = function (callback){
                options.write(encode(this), callback);
            };
            callback(settings);
        });
    }else{
        options.readSync = options.readSync || function (){
            if(require('path').existsSync('settings.json'))
                return fs.readFileSync('settings.json', 'utf8');
            else
                return false;
        };
        options.writeSync = options.writeSync || function (data){ 
            fs.writeFileSync('settings.json', data, 'utf8'); 
        };
        return (function(){
            var settings = decode(options.readSync());
            settings.save = function(){options.writeSync(encode(this));};
            return settings;
        }());
    }
}
require("repl").start();


function parse(prop){
    var arg = process.argv;
    for (var i = 0; i<arg.length; i++){
        if(arg[i] === prop) return arg[i+1];
    }
}
var key = parse("-key"),
    prop = parse("-prop"),
    val = parse("-val");
    
function cryptoSettings(readSync, writeSync){    
    var settings = {};
    try{
        settings = JSON.parse(readSync());
        if(settings.encrypted){
            settings = JSON.parse(decrypt(settings.data, key));
        }
    }catch(ex){
        console.log("settings file is corrupt, delete it to recover");
    }
    
    if(prop && val){
        console.log("Changed " + prop + " from " + settings[prop] + " to " + val);
        settings[prop] = val;
        if(key){
            var enc = {encrypted:true, data:encrypt(JSON.stringify(settings), key)};
            writeSync(JSON.stringify(enc));
        }else{
            writeSync(JSON.stringify(settings));
        }
    } else if (prop){
        console.log(prop + " is set to " + settings[prop]);
    }
    return settings;
}