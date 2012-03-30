var fs = require("fs"),
    crypto = require("crypto");

function parse(prop){
	var arg = process.argv;
	for (var i = 0; i<arg.length; i++){
        if(arg[i] === prop) return arg[i+1];
    }
}
function exists(prop){
	var arg = process.argv;
	for (var i = 0; i<arg.length; i++){
        if(arg[i] === prop) return true;
    }
    return false;
}
function useConsole(isAsync, settings){
	return function(callback){
		var repl = require("repl").start();
		repl.context.settings = settings;
		repl.rli.on('close', function(){
			if(!isAsync){
				settings.save();
				if(callback) callback();
				else console.log("saved");
			} else {
				settings.save(function(err){
					if(err) throw err;
					if(callback) callback();
					else console.log("saved");
				});
			}
		});
	};
}
module.exports = function (optionsOrCallback, callback){
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
    options.password = options.password || parse("-pass") || "";
    options.useConsole = options.useConsole || exists("-edit");
    options.print = options.print || exists("-print");
    
    var password = options.password;
    
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
            if(options.print) {
                console.log("settings");
                console.log("========");
                console.log(settings);
            }
            if(options.useConsole){
                useConsole(isAsync, settings)(function(){
                	settings.useConsole = useConsole(isAsync, settings);
                	callback(settings);
                });
            }else{
                settings.useConsole = useConsole(isAsync, settings);
                callback(settings);
            }
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
            if(options.print) {
                console.log("settings");
                console.log("========");
                console.log(settings);
            }
            settings.save = function(){ 
                return options.writeSync(encode(this));
            };
            if(options.useConsole){
                useConsole(isAsync, settings)();
            }else{
                settings.useConsole = useConsole(isAsync, settings);
            }
            return settings;
        }());
    }
};