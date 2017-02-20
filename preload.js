//jscs:disable maximumLineLength
// get lrc
function getLrc(songID) {
  $.get('http://music.163.com/api/song/lyric?lv=-1&tv=-1&id=' + songID, function (result) {
      var newLrc = JSON.parse(result).lrc.lyric.toString();
      var blob = new Blob([newLrc], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, '歌词.lrc');

      // console.log(newLrc);
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

  // Change style
  iframeDiv.find('#g_top, #g_nav').remove();

  function changeStyle() {
    var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);
    $('#g-topbar, .g-btmbar').remove();
    if (iframeDiv.find('.g-ft').length > 0) {
      iframeDiv.find('#g_top, #g_nav, .g-ft, .u-lstlay.j-flag, .m-tabs.m-tabs-srch.f-cb.ztag').remove();
      iframeDiv.find('html, body').css('overflow-x', 'hidden');
      iframeDiv.find('.n-srch .pgsrch').css('width', '100%');
      iframeDiv.find('.n-srch .pgsrch, .n-srch .pgsrch .btn').css('background-image', 'url(http://ofcgpg3h5.bkt.clouddn.com/Music163/search_button.png)');
      iframeDiv.find('.n-srch .pgsrch .srch').css({
          width: '810px',
          padding: '12px 20px',
          margin: '0',
          background: 'transparent',
        });
      iframeDiv.find('.n-srch .pgsrch .btn').hover(function () {
          $(this).css('background-position', '-910px 0');
        }, function () {

          $(this).css('background-position', '0 9999px');
        });

      // Bind download
      iframeDiv.find('#m-search').on('click', '[title="播放"]', function (event) {
          event.preventDefault();
          var songID = $(this).attr('data-res-id');
          var item = $(this).parents('.item');
          var songName = item.children('.td.w0').find('.text').text();
          var artist = item.children('.td.w1').children('.text').text();
          var album = item.children('.td.w2').children('.text').text().replace('《', '').replace('》', '');
          console.log(album + '-' + songName + '-' + artist);
          getLrc(songID);
        });

      clearInterval(timerCS);
    }
  }

  var timerCS = setInterval(changeStyle, 100);

  // Execute loop
  function executeLoop() {
    // remove href
    var iframeDiv = $(document.getElementById('g_iframe').contentWindow.document);

    if (iframeDiv.find('[href]').length > 0) iframeDiv.find('a').removeAttr('href');

    if (iframeDiv.find('.opt.hshow').length > 0) iframeDiv.find('.opt.hshow').remove();

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
