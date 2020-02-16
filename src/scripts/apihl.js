const apihl = oText => {
    const core = {
        spanl:'<span class="apihl_',
        spanm :'">',
        spanr:'</span>',
        textToHTML:text=>text.replace(/</g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        normalLabel:text=>{
            let parts = /^(<[!\/]?)([a-z_][\w:]*)([^>]*?(?=[\/>]))(\/?>)$/i.exec(text);
            return (core.spanl + 'mk' + core.spanm + core.textToHTML(parts[1]) + core.spanr
                    + core.spanl + 'lb' + core.spanm + parts[2] + core.spanr
                    + (parts[3] ? core.labelValues(parts[3]) : '') + core.spanl
                    + 'mk' + core.spanm + core.textToHTML(parts[4]) + core.spanr);
        },
        labelValues:text=>{
            let vlGlobalRe = /[a-z_]+\s*=\s*(".*?("|(?=$))|'.*?('|(?=$))|[^\s]*)|[a-z_]+ *=|[a-z_]+|(".*?("|(?=$))|'.*?('|(?=$)))/gi;
            let vlfRE = /^([a-z_]+)(\s*=\s*)(".*?("|(?=$))|'.*?('|(?=$))|[^\s]*)$/i;
            let vlneRE = /^([a-z_]+)(\s*=)$/i;
            let vlnRE = /^([a-z_]+)$/i;
            let vlvRE = /^(".*?("|(?=$))|'.*?('|(?=$)))$/;
            return text.replace(vlGlobalRe, s => {
                let parts;
                if (parts = vlfRE.exec(s))
                    return (
                core.spanl + 'vn' + core.spanm + parts[1] + core.spanr +
                core.spanl + 'mk' + core.spanm + parts[2] + core.spanr +
                core.spanl + 'vl' + core.spanm + parts[3] + core.spanr);

                if (parts = vlneRE.exec(s))
                    return (
                core.spanl + 'vn' + core.spanm + parts[1] + core.spanr +
                core.spanl + 'mk' + core.spanm + parts[2] + core.spanr);

                if (vlnRE.test(s))
                    return core.spanl + 'vn' + core.spanm + s + core.spanr;
                if (vlvRE.test(s))
                    return core.spanl + 'mk' + core.spanm + s + core.spanr;
                return s;
            });
        },
        convertHTML:text => {
            let globalRE = /(<!\-\-[\s\S]*?\-\->)|(<script(\s[^>]*)?>[\s\S]*?<\/script>)|(<style(\s[^>]*)?>[\s\S]*?<\/style>)|(<(!doctype|\/?[a-z_][\w:]*)([^>]*)>)/ig;
            let cmRE = /^<!\-\-[\s\S]*?\-\->$/;
            let scRE = /^(<script(\s[^>]*)?>)([\s\S]*?)(<\/script>)$/i;
            let stRE = /^(<style(\s[^>]*)?>)([\s\S]*?)(<\/style>)$/i;
            let otRE = /^<(!doctype|\/?[a-z_][\w:]*)([^>]*)>$/i;
    
            text = text.replace(/&/g, '&amp;');
            return text.replace(globalRE,s => {
                var parts;
                if (cmRE.test(s))
                    return core.spanl + 'cm' + core.spanm + core.textToHTML(s) + core.spanr;
                if (parts = scRE.exec(s))
                    return core.normalLabel(parts[1]) + core.convertJS(parts[3]) + core.normalLabel(parts[4]);
                if (parts = stRE.exec(s))
                    return core.normalLabel(parts[1]) + core.convertCSS(parts[3]) + core.normalLabel(parts[4]);
                if (otRE.test(s))
                    return core.normalLabel(s);
            });
        },
        cssValues:text => text.replace(/([a-z-]+)( *:\s*)([\s\S]*?)(;|$)/gi, (...args) => 
                        core.spanl + 'cn' + core.spanm + args[1] + core.spanr + args[2] +
                        core.spanl + 'cv' + core.spanm + args[3] + core.spanr + args[4]),
        convertCSS:text => {
            let globalRE = /\/\*[\s\S]*?\*\/|@[a-z-]+[\s\S]*?(;|\{|$)|[^\{\}\s,]+|\{[\s\S]*?\}/gi;

            let cmRE = /^\/\*[\s\S]*?\*\/$/;
            let blRE = /^(@[a-z-]+)([\s\S]*?(;|\{|$))$/i;
            let slRE = /^[^\{\}\s,]+$/;
            let ctRE = /^\{([\s\S]+?)\}$/;
            text = core.textToHTML(text);
            return text.replace(globalRE, s => {
                let parts;
                if (cmRE.test(s)) return core.spanl + 'cm' + core.spanm + s + core.spanr;
                if (parts = blRE.exec(s)) return core.spanl + 'bl' + core.spanm + parts[1] + core.spanr + parts[2];
                if (slRE.test(s)) return core.spanl + 'sl' + core.spanm + s + core.spanr;
                if (parts = ctRE.exec(s)) return '{' + core.cssValues(parts[1]) + '}';
                return s;
            });
        },
        convertJS:text => {

            let names = ["", "cm", "st", "", "re", "kw"];

            let globalRE = /(\/\*[\s\S]*?\*\/|\/\/.*)|((['"])(?:\\[\s\S]|[^\\\r\n])*?\3)|(\/(?:\\.|[^\\\r\n])*?\/[gim]{0,3})|((?:[^\w]|^)(?:break|delete|function|return|typeof|case|do|if|switch|var|catch|else|in|this|void|continue|false|instanceof|throw|while|debugger|finally|new|true|with|default|for|null|try)(?=[^\w]|$))/g;
    
            text = core.textToHTML(text);
    
            return text.replace(globalRE, (...args) => {
                var i, s;
                for (i = 1; s = args[i], i < 5; i++)
                    if (s)
                        return core.spanl + names[i] + core.spanm + s + core.spanr;
                return s.replace(/\w+/, kw => core.spanl + names[i] + core.spanm + kw + core.spanr);
            });
        }
    }

    if (/^\s*</.test(oText)) return core.convertHTML(oText);
    else {
        let temp = oText.replace(/(\/\*[\s\S]*?\*\/)/g, '').replace(/((['"])(\2|.*?([^\\]\2|\\\\\2)))/g, '');

        let cssKeysCount = (temp.match(/[\w.#]+\s*{[\s\S]*?}/g) || []).length;
        let jsKeysCount = (temp.match(/(^|[^\w])(var|let|for|if|else|function)[^\w]|=|\+/g) || []).length;

        return cssKeysCount > jsKeysCount ? core.convertCSS(oText) : core.convertJS(oText);
    }
}

export default apihl