// Generated by CoffeeScript 1.6.3
(function() {
  var ApiClient, crypto, fs, http, md5, urllib;

  fs = require('fs');

  crypto = require('crypto');

  urllib = require('urllib');

  http = require('http');

  ApiClient = ApiClient = (function() {
    function ApiClient() {}

    ApiClient.prototype.cookies = {};

    ApiClient.prototype.token = '';

    ApiClient.prototype.cgi = 'https://mp.weixin.qq.com/cgi-bin/';

    ApiClient.prototype.agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36';

    ApiClient.prototype.username = void 0;

    ApiClient.prototype.password = void 0;

    ApiClient.prototype.login = function(username, password, imgcode, cb) {
      var _this = this;
      this.username = username;
      this.password = password;
      return urllib.request(this.cgi + 'login?lang=zh_CN', {
        dataType: 'json',
        headers: {
          'Referer': this.cgi + 'loginpage?t=wxm2-login&lang=zh_CN',
          'User-Agent': this.agent
        },
        data: {
          username: username,
          pwd: md5(password),
          imagecode: imgcode || '',
          f: 'json'
        },
        type: 'POST',
        timeout: 30000
      }, function(err, body, res) {
        var cookies, rs, token;
        if (body && body.ErrCode === -6) {
          return _this.fetchVerifyCode(username, function(err, path) {
            var rep;
            if (!err) {
              rep = new Error('verifycode');
              rep.localpath = path;
            }
            return cb && cb(rep);
          });
        } else {
          token = void 0;
          if (body && (rs = body.base_resp.err_msg.toString().match(/\btoken=(\d+)/)) && rs[1]) {
            _this.token = token = rs[1];
            _this.username = username;
            _this.password = password;
            cookies = _this._receiveCookies(res);
            _this.cookies['cert'] = cookies['cert'];
            _this.cookies['slave_user'] = cookies['slave_user'];
            _this.cookies['slave_sid'] = cookies['slave_sid'];
          }
          return cb && cb(err, token);
        }
      });
    };

    ApiClient.prototype.fetchVerifyCode = function(username, cb) {
      var filepipe, path,
        _this = this;
      path = process.cwd() + ("/tmp/" + username + ".jpeg");
      filepipe = fs.createWriteStream(path);
      return urllib.request(this.cgi + 'verifycode?username=#{username}&r=#{new Date}', {
        headers: {
          'Referer': this.cgi + 'loginpage?t=wxm2-login&lang=zh_CN',
          'User-Agent': this.agent
        },
        type: 'GET',
        writeStream: filepipe
      }, function(err, body, res) {
        return cb && cb(err, err ? void 0 : path);
      });
    };

    ApiClient.prototype.scanuser = function(pageidx, cb) {
      return this._request(this.cgi + ("contactmanage?t=user/index&pagesize=10&pageidx=" + (pageidx || 0) + "&type=0&groupid=0&token=" + this.token + "&lang=zh_CN"), {}, function(err, body, res) {
        var cgiData, rs;
        if (body) {
          rs = /wx\.cgiData=([\s\w\W]+?)seajs\.use/.exec(body.toString());
        }
        cgiData = void 0;
        if (rs) {
          eval('cgiData=' + rs[1]);
        }
        return cb && cb(err, cgiData);
      });
    };

    ApiClient.prototype.scanmessage = function(count, cb) {
      return this._request(this.cgi + ("message?t=message/list&count=" + (count || 100) + "&day=7&token=" + this.token + "&lang=zh_CN"), {}, function(err, body, res) {
        var cgiData, rs;
        if (body) {
          rs = /wx\.cgiData = ([\s\w\W]+?)seajs\.use/.exec(body.toString());
        }
        cgiData = void 0;
        if (rs) {
          eval('cgiData=' + rs[1]);
        }
        return cb && cb(err, cgiData);
      });
    };

    ApiClient.prototype.usermessage = function(fakeid, cb) {
      return this._request(this.cgi + ("singlesendpage?action=index&t=message/sen&tofakeid=" + fakeid + "&lang=zh_CN"), {}, function(err, body, res) {
        var cgiData, rs;
        if (body) {
          rs = /<script type=\"text\/javascript\">\s+wx\.cgiData = ([\s\w\W]+?)wx\.cgiData\.tofakeid/.exec(body.toString());
        }
        cgiData = void 0;
        if (rs) {
          eval('cgiData=' + rs[1]);
        }
        return cb && cb(err, cgiData.msg_items.msg_item);
      });
    };

    ApiClient.prototype.appid = function(cb) {
      return this._request(this.cgi + ("advanced?action=dev&t=advanced/dev&token=" + this.token + "&lang=zh_CN"), {}, function(err, body, res) {
        var cgiData, rs;
        if (body) {
          rs = /<script type=\"text\/javascript\">\s+cgiData = ([\s\w\W]+?)seajs\.use\(\"advanced\/dev\"\)/.exec(body.toString());
        }
        cgiData = void 0;
        if (rs) {
          eval('cgiData=' + rs[1]);
        }
        return cb && cb(err, cgiData.devInfo);
      });
    };

    ApiClient.prototype.userinfo = function(fakeid, cb) {
      var opts;
      opts = {
        type: 'POST',
        dataType: 'json',
        data: {
          token: this.token,
          lang: "zh_CN",
          t: "ajax-getcontactinfo",
          fakeid: fakeid
        },
        headers: {
          Referer: "" + this.cgi + "contactmanage?t=user/index&pagesize=10&pageidx=0&type=0&groupid=0&lang=zh_CN&token=" + this.gtoken
        }
      };
      return this._request("" + this.cgi + "getcontactinfo", opts, function(err, body, res) {
        console.log(err, err ? void 0 : body);
        return cb && cb(err, body);
      });
    };

    ApiClient.prototype.bindApiToken = function(url, token, cb) {
      var opts;
      opts = {
        type: 'POST',
        dataType: 'json',
        data: {
          url: url,
          callback_token: token
        },
        headers: {
          Referer: "" + this.cgi + "advanced?action=interface&t=advanced/interface&token=" + this.token + "&lang=zh_CN"
        }
      };
      return this._request("" + this.cgi + "callbackprofile?t=ajax-response&token=" + this.token + "&lang=zh_CN", opts, function(err, body, res) {
        console.log(err, err ? void 0 : body);
        return cb && cb(err, body);
      });
    };

    ApiClient.prototype.headimg = function(fakeid, localpath, cb) {
      return this._request(this.cgi + ("getheadimg?fakeid=" + fakeid + "&token=" + this.token + "&lang=zh_CN"), {
        writeStream: fs.createWriteStream(localpath),
        headers: {
          'User-Agent': this.agent,
          'Cookie': this._sendCookies()
        }
      }, function(err, body, res) {
        return cb && cb(err);
      });
    };

    ApiClient.prototype.voice = function(msgid, localpath, cb) {
      console.log(msgid);
      return this._request(this.cgi + ("downloadfile?msgid=" + msgid + "&source=&token=" + this.token), {
        writeStream: fs.createWriteStream(localpath),
        headers: {
          'User-Agent': this.agent,
          'Cookie': this._sendCookies()
        }
      }, function(err, body, res) {
        console.log('voice finish');
        return cb && cb(err);
      });
    };

    ApiClient.prototype.send = function(fakeid, txt, cb) {
      var opts;
      opts = {
        type: 'POST',
        headers: {
          'Referer': this.cgi + 'singlesendpage?' + 'tofakeid=' + fakeid + 't=message/send&action=index&token=#{@gtoken}&lang=zh_CN'
        },
        data: {
          type: 1,
          content: txt,
          error: false,
          imgcode: '',
          tofakeid: fakeid,
          token: this.token,
          ajax: 1,
          dataType: 'json'
        }
      };
      console.log(opts);
      return this._request(this.cgi + "singlesend", opts, function(err, body) {
        return console.log(err, body.toString());
      });
    };

    ApiClient.prototype._receiveCookies = function(res) {
      var c, r, ret, _i, _len, _ref;
      ret = {};
      if (!res.headers['set-cookie']) {
        return ret;
      }
      _ref = res.headers['set-cookie'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (r = /^(.*?)=(.*);\s*Path=./.exec(c)) {
          ret[r[1]] = r[2];
        }
      }
      return ret;
    };

    ApiClient.prototype._sendCookies = function() {
      var cookies, n, v, _ref;
      cookies = '';
      _ref = this.cookies;
      for (n in _ref) {
        v = _ref[n];
        cookies += '; ';
        cookies += "" + n + "=" + v;
      }
      return cookies || void 0;
    };

    ApiClient.prototype._request = function(url, opts, cb) {
      var makesession,
        _this = this;
      opts.timeout = 30000;
      makesession = function() {
        var _url;
        if (!opts.headers) {
          opts.headers = {};
        }
        opts.headers.Cookie = _this._sendCookies();
        opts.headers['User-Agent'] = _this.agent;
        _url = url;
        if (opts.type === 'POST') {
          if (!opts.data) {
            opts.data = {};
          }
          opts.data.token = _this.token;
        } else {
          _url += "&token=" + _this.token;
        }
        return _url;
      };
      return urllib.request(makesession(), opts, function(err, body, res) {
        if (_this.username && body && body.toString().match(/登录超时/)) {
          console.log('wechat session time out, auto relogin ...');
          _this.login(_this.username, _this.password, '', function(err, token) {
            if (token) {
              console.log("relogined to wechat, new token is : " + token);
              return urllib.request(makesession(), opts, cb);
            } else {
              console.log('relogined fail.');
              return cb && cb(err);
            }
          });
          return;
        }
        return cb && cb(err, body, res);
      });
    };

    return ApiClient;

  })();

  module.exports = ApiClient;

  md5 = function(input) {
    return crypto.createHash('md5').update(input).digest('hex');
  };

}).call(this);
