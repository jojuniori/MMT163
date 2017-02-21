//jscs:disable maximumLineLength
// get lrc
function getLrc(songID, saveName) {
  $.get('http://music.163.com/api/song/lyric?lv=-1&tv=-1&id=' + songID, function (result) {
      var presult = JSON.parse(result);

      // check lyric
      if (!presult.nolyric && !presult.uncollected) {
        var newLrc = '';
        newLrc += presult.lrc.lyric.toString();

        // check translation
        if (presult.tlyric.lyric !== null) newLrc += presult.tlyric.lyric.toString();

        // cache lyric
        var blob = new Blob([newLrc], {
            type: 'text/plain;charset=utf-8',
          });

        // console.log(newLrc);
        saveAs(blob, saveName + '.lrc');
      } else {
        alert('无歌词');
      }
    });
}

// load jQuery
function loadjQ() {
  var Script = document.createElement('script');
  Script.setAttribute('src', 'http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js');
  Script.setAttribute('type', 'text/javascript');
  document.body.appendChild(Script);
  if ($.get !== undefined) {
    onload();
  }
}

// load FileSave
function loadFS() {
  var Script = document.createElement('script');
  Script.setAttribute('src', 'http://ofcgpg3h5.bkt.clouddn.com/Music163/FileSaver.min.js');
  Script.setAttribute('type', 'text/javascript');
  document.body.appendChild(Script);
}

var timer = setInterval(loadjQ, 100);

// load page
function onload() {
  loadFS();
  clearInterval(timer);
  var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);

  //Change title
  $('title').text('网易云歌词');

  // iFrame onload
  iframeDiv.find('#g_top, #g_nav').remove();

  function changeStyle() {
    var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);
    $('#g-topbar, .g-btmbar').remove();
    if (iframeDiv.find('head').length > 0) {
      // iframeDiv.find('head').append('<link rel="stylesheet" type="text/css" href="http://ofcgpg3h5.bkt.clouddn.com/Music163-style.css">');
      iframeDiv.find('head').append('<link rel="stylesheet" type="text/css" href="http://xin.moem.cc/lrc163/lrc163.css">');

      // add placeholder
      iframeDiv.find('#m-search-input').attr('placeholder', '输入 单曲/歌手/专辑/网易云音乐ID 进行搜索');

      // Bind download
      iframeDiv.find('#m-search').on('click', '[title="播放"]', function (event) {
          event.preventDefault();
          var songID = $(this).attr('data-res-id');
          var item = $(this).parents('.item');
          var songName = item.children('.td.w0').find('.text').text();
          var artist = item.children('.td.w1').children('.text').text();
          var album = item.children('.td.w2').children('.text').text().replace('《', '').replace('》', '');
          var saveName = album + ' - ' + songName + ' - ' + artist;
          console.log(saveName);
          getLrc(songID, saveName);
        });

      clearInterval(timerCS);
    }
  }

  var timerCS = setInterval(changeStyle, 100);

  // Execute loop
  function executeLoop() {
    var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);

    // remove href
    if (iframeDiv.find('[href]').length > 0) iframeDiv.find('a').removeAttr('href');

    // failed code... don't care this...
    // $.each(iframeDiv.find('[href]'), function (index, value) {
    //     // $(this).attr('onclick', 'function(e) {require("electron").shell.openExternal(' + value + ')}').removeAttr('href');
    //     if ($(this).attr('target') === undefined) {
    //       $(this).attr('target', '_blank');
    //     }
    //
    //     console.log(index + ':' + value);
    //   });
  }

  var timerEL = setInterval(executeLoop, 100);
}
