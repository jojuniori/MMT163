const { nativeImage, ipcRenderer } = require('electron');

var downloader = {
    count: 0,
    callbacks: {},
    init() {
        ipcRenderer.on('async-download-finish', this.handleDownloadFinish);
    },
    download(url, cb) {
        let taskId = ++downloader.count;
        this.callbacks[taskId] = cb;
        ipcRenderer.send("async-download-start", taskId, url);
    },
    
    handleDownloadFinish(evt, taskId, chunk) {
        downloader.callbacks[taskId](chunk);
        delete downloader.callbacks[taskId];
    }
};

downloader.init();

var requestUse = {
    count: 0,
    callbacks: {},
    init() {
        ipcRenderer.on('async-requestUse-finish', this.handleRequestUseFinish);
    },
    requestUse(url, cb) {
        let taskId = ++requestUse.count;
        this.callbacks[taskId] = cb;
        ipcRenderer.send("async-requestUse-start", taskId, url);
    },
    
    handleRequestUseFinish(evt, taskId, chunk) {
        requestUse.callbacks[taskId](chunk);
        delete requestUse.callbacks[taskId];
    }
};

requestUse.init();


/**
 * Get lrc
 * @param {number} songID 
 * @param {string} saveName 
 */
function getLrc(songID, saveName) {
    $.get('http://music.163.com/api/song/lyric?lv=-1&tv=-1&id=' + songID, function(result) {
        var presult = JSON.parse(result);

        // check lyric
        if (!presult.nolyric && !presult.uncollected) {
            let iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);

            let original, translate, allLrc;
            original = presult.lrc.lyric.toString();
            if (presult.tlyric.lyric !== null) translate = presult.tlyric.lyric.toString();
            allLrc = original + translate;

            if (iframeDiv.find('#original').is(':checked')) {
                let blob = new Blob([original], { type: 'text/plaincharset=utf-8' });
                saveAs(blob, saveName + ' - original.lrc');
            }
            if (iframeDiv.find('#translate').is(':checked')) {
                if (presult.tlyric.lyric !== null) {
                    let blob = new Blob([translate], { type: 'text/plaincharset=utf-8' });
                    saveAs(blob, saveName + ' - translate.lrc');
                } else {
                    alert('木有翻译');
                }
            }
            if (iframeDiv.find('#allLrc').is(':checked')) {
                let blob = new Blob([allLrc], { type: 'text/plaincharset=utf-8' });
                saveAs(blob, saveName + '.lrc');
            }

            // Count if downloaded successfullyCount
            requestUse.requestUse('useLrc');
        } else {
            alert('无歌词');
        }
    });
}

// load jQuery
function loadjQ() {
    let Script = document.createElement('script');
    Script.setAttribute('src', require('path').join(__dirname, 'jquery.min.js'));
    Script.setAttribute('type', 'text/javascript');
    document.body.appendChild(Script);
    if ($.get !== undefined) {
        onload();
    }
}

// load FileSave
function loadFS() {
    let Script = document.createElement('script');
    Script.setAttribute('src', require('path').join(__dirname, 'FileSaver.min.js'));
    Script.setAttribute('type', 'text/javascript');
    document.body.appendChild(Script);
}

var timer = setInterval(loadjQ, 100);

// load page
function onload() {
    loadFS();
    clearInterval(timer);
    var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);

    // iFrame onload
    iframeDiv.find('#g_top, #g_nav').remove();

    function changeStyle() {
        var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);
        $('#g-topbar, .g-btmbar').remove();
        if (iframeDiv.find('#m-search').length > 0) {
            // load icon font
            let linkIcon = document.createElement('link');
            linkIcon.setAttribute('rel', 'stylesheet');
            linkIcon.setAttribute('href', require('path').join(__dirname, 'css/iconfont', 'material-icons.css'));
            document.getElementById('g_iframe').contentWindow.document.head.appendChild(linkIcon);
            // load css
            let linkCss = document.createElement('link');
            linkCss.setAttribute('rel', 'stylesheet');
            linkCss.setAttribute('href', require('path').join(__dirname, 'css', 'MMT163.css'));
            document.getElementById('g_iframe').contentWindow.document.head.appendChild(linkCss);

            // setting cache
            let set_allLrc, set_original, set_translate;
            if (localStorage.allLrc === undefined) {
            localStorage.allLrc     = 1;
            localStorage.original   = 0;
            localStorage.translate  = 0;
            } else {
                set_allLrc    = parseInt(localStorage.allLrc);
                set_original  = parseInt(localStorage.original);
                set_translate = parseInt(localStorage.translate);
            }

            // add setting html
            let template = '<div class="MMT">' +
                '   <a class="setting-button"> <i class="material-icons">&#xE8B8;</i> </a>' +
                '   <div class="setting-frame">' +
                '       <div><input type="checkbox" id="allLrc" ' + (set_allLrc ? 'checked' : '') + ' /> <label for="allLrc">下载二合一歌词</label></div>' +
                '       <div><input type="checkbox" id="original" ' + (set_original ? 'checked' : '') + ' /> <label for="original">下载原文歌词</label></div>' +
                '       <div><input type="checkbox" id="translate" ' + (set_translate ? 'checked' : '') + ' /> <label for="translate">下载翻译歌词</label></div>' +
                '   </div>' +
                '</div>';
            iframeDiv.find('body').append(template);
            iframeDiv.find('.MMT').on('click', '.setting-button', function(event) {
                event.preventDefault();
                $(this).toggleClass('open');
            });
            iframeDiv.find('.MMT').on('click', '.setting-frame div input', function(event) {
                let checked = $(this).is(':checked');
                let option = $(this).attr('id');
                // console.log(option + ':' + checked)
                if (checked) {
                    localStorage[option] = 1;
                } else {
                    localStorage[option] = 0;
                }
            });

            // add placeholder
            iframeDiv.find('#m-search-input').attr('placeholder', '输入 单曲/歌手/专辑/网易云音乐ID 进行搜索');

            // Bind download lrc
            iframeDiv.find('#m-search').on('click', '[title="播放"]', function(event) {
                event.preventDefault();
                var songID   = $(this).attr('data-res-id');
                var item     = $(this).parents('.item');
                var songName = item.children('.td.w0').find('.text a').text();
                var artist   = item.children('.td.w1').children('.text').text();
                var album    = item.children('.td.w2').children('.text').text().replace('《', '').replace('》', '');
                var saveName = album + ' - ' + songName + ' - ' + artist;
                // console.log(saveName);
                getLrc(songID, saveName);
            });

            // Bind download cover
            iframeDiv.find('#m-search').on('click', '.u-cover', function(event) {
                event.preventDefault();
                // get cover source link
                var imgSrc = $(this).find('img').attr('src').replace(/\?(.*)$/, '');
                // console.log(imgSrc);
                // get cover info
                var album = $(this).next('.dec').children('.tit').text();
                // download and rename cover
                downloader.download(imgSrc, function(chunk) {
                    let img = nativeImage.createFromBuffer(chunk).toJPEG(100);
                    saveAs(new Blob([img]), album + " - Cover.jpg");

                    // Count if downloaded successfully
                    requestUse.requestUse('useCover');
                });
            });

            clearInterval(timerCS);
        }
    }

    var timerCS = setInterval(changeStyle, 100);

    // Execute loop
    function executeLoop() {
        var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);

        // remove href and play event
        if (iframeDiv.find('[href]').length > 0) iframeDiv.find('a').removeAttr('href');
        if (iframeDiv.find('[data-res-action="play"]').length > 0) iframeDiv.find('[data-res-action="play"]').removeAttr('data-res-action');

        //Change title
        if ($('title').text() !== "网易云工具") $('title').text('网易云工具');

        //** failed code... don't care this... **//
        // $.each(iframeDiv.find('[href]'), function (index, value) {
        //     // $(this).attr('onclick', 'function(e) {require("electron").shell.openExternal(' + value + ')}').removeAttr('href')
        //     if ($(this).attr('target') === undefined) {
        //       $(this).attr('target', '_blank')
        //     }
        //
        //     console.log(index + ':' + value)
        //   })
    }

    var timerEL = setInterval(executeLoop, 100);
}