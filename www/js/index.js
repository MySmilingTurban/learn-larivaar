//Settings
var ang                   = window.localStorage["ang"]                    || 1;
var font_size             = window.localStorage["font_size"]              || 20;
var dark                  = window.localStorage["dark"]                   || 0;
var samaaptee             = window.localStorage["samaaptee"]              || null;
var daily                 = window.localStorage["daily"]                  || null;
var today_date            = window.localStorage["today_date"]             || null;
var today_start           = window.localStorage["today_start"]            || null;
var today_read            = ang - today_start;
var daily_total           = 0;
var swipe_nav             = window.localStorage["swipe_nav"]              || 1;
var larreevaar            = window.localStorage["larreevaar"]             || 1;
var larreevaar_assistance = window.localStorage["larreevaar_assistance"]  || 0;
var lang                  = "en";//window.localStorage["lang"]                   || "en";

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  StatusBar.show();
  if (dark) {
    StatusBar.backgroundColorByHexString('333333');
  } else {
    StatusBar.styleDefault();
  }
  window.localStorage["no_smartbanner"] = 1;
  $("#smartbanner").remove();
  $("body").removeClass("smartbanner");
  $("script[src='js/jquery.smartbanner.js']").remove();
}

function calculateDailyAngs(samaaptee, ang) {
  var samaaptee_date = processDate(samaaptee);
  var daily_angs = Math.ceil((1430-ang+1)/samaaptee_date['diff']);
  $("#samaaptee_daily_angs").text(daily_angs).parent("#samaaptee_daily_angs_cont").show();
  daily_total = daily_angs;
}
function calculateSamaapteeDate(angs, ang) {
  //Days left
  var days_left = Math.ceil((1430-ang+1)/angs);
  var date = new Date();
  var samaaptee_date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), (date.getDate() + days_left)));
  $("#daily_angs_projected_samaaptee").text(formatDate(samaaptee_date)).parent("#daily_angs_projected_samaaptee_cont").show();
}

function updateProgress(){
  if (daily_total > 0) {
    today_read = ang - today_start;
    var percent = Math.round((today_read/daily_total*100),1);
    if (percent > 100) {
      percent = 100;
    } else if (percent < 0) {
      percent = 0;
    }
    $("#sehaj_paatth_progress").show().parent("a").addClass("hide-arrow");
    $("#sehaj_paatth_today_read").text(today_read);
    $("#sehaj_paatth_daily_total").text(daily_total);
    $("#sehaj_paatth_setting_progress_bar").css("width", percent+"%");
  } else {
    $("#sehaj_paatth_progress").hide().parent("a").removeClass("hide-arow");
    $("#sehaj_paatth_setting_progress_bar").css("width", 0);
  }
}

function processDate(future_date) {
  var oneDay    = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  var new_date  = new Date(future_date);
  var today     = new Date();
  var year      = today.getFullYear();
  var month     = today.getMonth();
  var day       = today.getDate();
  today         = new Date(Date.UTC(year,month,day));
  
  return {
    "diff" : Math.round((new_date.getTime() - today.getTime())/(oneDay)),
    "new_date" : formatDate(new_date)
  }
}

function formatDate(date) {
  var year  = date.getUTCFullYear();
  var month = date.getUTCMonth() + 1;
  var day   = date.getUTCDate();
  month     = (month < 10) ? "0" + month : month;
  day       = (day < 10) ? "0" + day : day;

  return "" + year + "-" + month + "-" + day;
}

function setAng(set_ang, store) {
  store = typeof store !== 'undefined' ? store : true;
  //Make sure it's an Ang within the proper range or set to 1
  var set_ang = parseInt(set_ang);
  if (set_ang < 1 || set_ang > 1430) set_ang = 1;
  //Set the one before and one after
  var minus1                = ((set_ang - 1) >= 1 ? (set_ang - 1) : 1);
  var plus1                 = ((set_ang + 1) <= 1430 ? (set_ang + 1) : 1430);
  $(".ang").val(set_ang);
  ang = set_ang;
  $(".minus1").data("ang", minus1);
  $(".plus1").data("ang", plus1);
  var newPaatth = '';
  $.get("paatth/" + ang + ".html", function(data) {
    shabads = data.split(' ');
    $.each(shabads, function(index,val){
      if(val.indexOf('॥') !== -1) {
        tag = "i";
      } else {
        tag = "span";
      }
      newPaatth += "<" + tag + ">" + val + (tag == "i" ? " " : "") + "</" + tag + "> ";
    });
    $("#paatth").html(newPaatth);
    window.scrollTo(0,0);
  });
  if (store === true) {
    window.localStorage["ang"] = ang;
  }
}
$(function() {
  setAng(ang, false);
  if (samaaptee) {
    calculateDailyAngs(samaaptee, ang);
  } else if (daily) {
    daily_total = daily;
    calculateSamaapteeDate(daily, ang);
  }
  //Check if today var is actually today or reset
  var today         = new Date();
  var year          = today.getFullYear();
  var month         = today.getMonth();
  var day           = today.getDate();
  var today_string  = new Date(Date.UTC(year,month,day));
  today_string      = formatDate(today);
  if (today_string != today_date) {
    window.localStorage["today_date"] = today_date = today_string;
    window.localStorage["today_start"] = today_start = ang;
  }
  updateProgress();
  font_size = parseInt(font_size);
  $("#paatth").css("font-size", font_size + "px");
  $(".setting[data-setting='larreevaar']").data("on", larreevaar);
  $("#larreevaar_assistance").data("on", larreevaar_assistance);
  if (larreevaar == 1)            $("#paatth").addClass("larreevaar");
  if (larreevaar_assistance == 1) $("#paatth, #larreevaar_assistance").addClass("larreevaar_assistance");
  $(".setting[data-setting='swipe_nav']").data("on", swipe_nav);
  $(".setting[data-setting='dark']").data("on", dark);
  if (dark == 1)                  $("body").addClass("dark");
  $("body").addClass("lang_" + lang);
  $(".setting[data-setting='lang'][data-value='" + lang + "']").addClass("cur");
  //if (Modernizr.inputtypes.date) {
    var tomorrow    = new Date(Date.UTC(year,month,(day+1)));
    tomorrow_string =  formatDate(tomorrow);
    //$("#samaaptee_date_input").attr("min",tomorrow_string);
  //} else {
    $("#samaaptee_date_input").datepicker({
      //altField: "#samaaptee_date_input",
      format: "yyyy-mm-dd",
    })
      .val(samaaptee)
      .on("changeDate", function(ev) {
        if (ev.date.valueOf() < tomorrow.valueOf()) {
          alert("Please choose a date in the future.");
          $("#samaaptee_date_input").datepicker("setValue", tomorrow_string);
        } else {
          var new_samaaptee = $(this).val();
          $("#samaaptee_date_input").datepicker("hide");
          window.localStorage['samaaptee'] = samaaptee = new_samaaptee;
          window.localStorage.removeItem('daily');
          daily = null;
          $("#daily_angs_input").val("");
          $("#daily_angs_projected_samaaptee").text("").parent("#daily_angs_projected_samaaptee_cont").hide();
          calculateDailyAngs(samaaptee, ang);
          updateProgress();

        }
      })
    ;
    if (samaaptee) {
      $("#samaaptee_date_input").datepicker("setValue", samaaptee);
    }
  //}
  $("#daily_angs_input").val(daily);
  //Change checkboxes to checked for settings that are on
  $(".setting.checkbox").each(function(){
    if ($(this).data("on") == "1") {
      $(this).find("i").removeClass("fa-square-o").addClass("fa-check-square-o");
    }
  });

  $("#settings_button").click(function() {
    ga('send','event','button','click','settings'); 
  });
  //FONT SIZE
  $(".bigger").click(function () {
    font_size += 1;
    $("#paatth").css("font-size", font_size + "px");
    window.localStorage["font_size"] = font_size;
    ga('send','event','setting','change','zoom','in');
  });
  $(".smaller").click(function () {
    font_size -= 1;
    $("#paatth").css("font-size", font_size + "px");
    window.localStorage["font_size"] = font_size;
    ga('send','event','setting','change','zoom','out');
  });
  //CHANGE ANG
  $(".submit_ang").submit(function(event) {
    ang = $(this).find("input").val();
    setAng(ang);
    window.localStorage["today_start"] = today_start = ang;
    if (samaaptee) {
      calculateDailyAngs(samaaptee, ang);
    }
    updateProgress();
    ga('send','event','submit','ang',ang);
    $('.ang').blur();
    event.preventDefault();
  });
  $("#navigation a.minus1, #navigation a.plus1").click(function () {
    setAng($(this).data("ang"));
    if ($(this).hasClass('minus1')) {
      ga('send','event','button','click','nav arrows','prev');
    } else {
      ga('send','event','button','click','nav arrows','next');
    }
    updateProgress();
  });
  $(".ang").focus(function(){
    $(this).select();
  })
  $(".setting").click(function () {
    setting = $(this).data("setting");
    data_on = $(this).data("on");
    if (data_on == "0") {
      window.localStorage[setting] = 1;
      $(this).data("on", "1");
      switch(setting) {
        case "larreevaar_assistance":
          $(this).addClass(setting);
          $("#paatth").addClass(setting);
          ga('send','event','button','click','assist','on');
          break;
        case "larreevaar":
          $("#paatth").addClass(setting);
          ga('send','event','setting','change','larreevaar','on');
          break;
        case "swipe_nav":
          swipe_nav = 1;
          ga('send','event','setting','change','swipe','on');
          break;
        case "dark":
          $("body").addClass(setting);
          ga('send','event','setting','change','dark','on');
          break;
      }
      if ($(this).hasClass("checkbox")) {
        $(this).find("i.fa-square-o").removeClass("fa-square-o").addClass("fa-check-square-o");
      }
    } else if (data_on == "1") {
      window.localStorage[$(this).data("setting")] = 0;
      $(this).data("on", "0");
      switch(setting) {
        case "larreevaar_assistance":
          $(this).removeClass(setting);
          $("#paatth").removeClass(setting);
          ga('send','event','button','click','assist','off');
          break;
        case "larreevaar":
          $("#paatth").removeClass(setting);
          ga('send','event','setting','change','larreevaar','off');
          break;
        case "swipe_nav":
          swipe_nav = 0;
          ga('send','event','setting','change','swipe','off');
          break;
        case "dark":
          $("body").removeClass(setting);
          ga('send','event','setting','change','dark','off');
          break;
      }
      if ($(this).hasClass("checkbox")) {
        $(this).find("i.fa-check-square-o").removeClass("fa-check-square-o").addClass("fa-square-o");
      }
    } else {
      switch (setting) {
        case "lang":
          lang = $(this).data("value");
          $("body").removeClass (function (index, css) {
            return (css.match (/\blang_\S+/g) || []).join(' ');
          });
          $("body").addClass("lang_" + lang);
          ga('send','event','setting','change','lang',lang);
          window.localStorage["lang"] = lang;
          $(".setting[data-setting='lang']").removeClass("cur");
          $(".setting[data-setting='lang'][data-value='" + lang + "']").addClass("cur");
          break;
      }
    }
  });
  $("#daily_angs_input").change(function() {
    var new_daily = parseInt($(this).val());
    if (new_daily > 0) {
      new_daily = (new_daily > 1430) ? 1430 : new_daily;
      window.localStorage['daily'] = daily = daily_total = new_daily;
      window.localStorage.removeItem('samaaptee');
      $(this).val(new_daily);
      calculateSamaapteeDate(daily, ang);
      updateProgress();
      samaaptee = null;
      $("#samaaptee_date_input").val("");
      $("#samaaptee_daily_angs").text("").parent("#samaaptee_daily_angs_cont").hide();
    } else if (new_daily == 0) {
      window.localStorage.removeItem("daily");
      daily = daily_total = null;
      $("#daily_angs_projected_samaaptee").text("").parent("#daily_angs_projected_samaaptee_cont").hide();
      window.localStorage.removeItem('samaaptee');
      samaaptee = null;
      $("#samaaptee_date_input").val("");
      $("#samaaptee_daily_angs").text("").parent("#samaaptee_daily_angs_cont").hide();
      updateProgress();
    } else {
      alert("Invalid number");
    }
  });
  if (!window.localStorage['no_smartbanner']) {
    $.smartbanner({
      layer: true,
      speedIn: 400
    });
  }
  if (swipe_nav) {
    var myElement = document.getElementById('paatth');
    var mc = new Hammer(myElement);
    mc.get("swipe").set({
      direction: Hammer.DIRECTION_HORIZONTAL,
      velocity: 0.2
    })
    mc.on("swipeleft swiperight", function(ev) {
      switch(ev.type) {
        case 'swiperight':
          $(".minus1").click();
          ga('send','event','swipe','right');
          break;
        case "swipeleft":
          $(".plus1").click();
          ga('send','event','swipe','left');
          break;
      }
    });
  }
});