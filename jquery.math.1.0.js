/*!
 * jQuery.math v1.0
 * http://epicapp.com/jquery.math
 *
 * Copyright (c) 2009 Mark Kockerbeck
 * Dual licensed under the MIT and GPL licenses.
 */
(function($){
  
  $.math = { 
    Version: 1,
    TotalDisplay: { OnEachRow: 0, OnLastRow: 1 },
    Stddev: { N: 0, NMinus1: 1 }
  }
  
  // settings
  $.extend($.math, {
    settings: {
      decimals: 2,
      extractNumbers: true,
      addExtractedNumbers: false,
      stddevDenominator: $.math.Stddev.N
    }  
  });

  // globals
  count = 0;
  subtotals = { }
  
  $.fn.getValue = $.getValue = function(v) {
    if(v == undefined) v = this;
    return $(v).text() == '' ? $(v).val() : $(v).text();
  }
  
  $.fn.getNumber = $.getNumber = getNumber = function(e) { 
    var settings = $.math.settings;
    if(e == undefined) e = $(this).getValue();
    if(!settings.extractNumbers && isNaN(e)) return 0;
    if(!isNaN(e)) return e - 0;
    e = e + ""
    var matches = e.match(/[\d\.\d]+/g), sum;
    if(settings.addExtractedNumbers) sum = 0; else sum = '';
    for(var i in matches) {
      if(settings.addExtractedNumbers) {
       if(isNaN(matches[i])) continue; // periods may match (i.e. " 134 test.ttest 434")
       sum += matches[i] - 0;
      } else {
       sum = sum + '' + matches[i];
      }
    }
    return sum - 0;
  }  
  
  $.fn.round = $.round = function(number, length) {
    if(number == undefined && length == undefined) {
      length = $.math.settings.decimals;
      number = $(this).getNumber();
    }
    else if(length == undefined && number != undefined) {
      length = number;
      number = $(this).getNumber();
    }
    return Math.round(number * Math.pow(10, length)) / Math.pow(10, length)  ;
  }
  
  $.fn.sum = $.sum = function(arg) {
    var settings = $.math.settings, sum = 0;
    count = 0;
    if(arg == undefined) {
      $(this).each(function(i,e){
        sum += $(e).getNumber();
        count += 1;
      });
    }	else {
      for(var i in arg) {
        sum += $.getNumber(arg[i]);
        count += 1;
      }
    }
    return $.round(sum, settings.decimals);
  }
  
  $.fn.average = $.average = function(arg) {
    var sum = 0;
    this.count = 0;
    if(arg == undefined) sum = $(this).sum();
    else sum = $.sum(arg);
    return $.round((sum/count), $.math.settings.decimals);
  }
  
  $.fn.stddev = $.stddev = function(arg) {
    var mean = 0, sumOfSquares = 0;
    this.count = 0;
    if(arg == undefined) {
      mean = $(this).average();
      $(this).each(function(i,e){
        var value = $(e).getNumber(), square = Math.pow((value - mean - 0), 2);
        sumOfSquares += square - 0;
      });
    }
    else {
      mean = $.average(arg);
      for(var i in arg) {
        var value = $.getNumber(arg[i]), square = Math.pow((value - mean - 0), 2);
        sumOfSquares += square - 0;
      }
    }
    return $.round(Math.sqrt((sumOfSquares / count)), $.math.settings.decimals);
  }

  $.fn.multiply = function(selector, factor) {
    $(this).each(function(i,e){
      var value = $.getNumber($(e).parent().children(selector).text());
      value = $.round( (value * factor) , 2 );
      $(e).text( value );
    });
    return this;
  }

  $.fn.total = function(options) {
    subtotals =  { } // clear subtotals for chaining
    $(this).each(function(i,e){
      var group = $(this).parent().children(options.groupBy).text(), value = $(this).getNumber();
      if(subtotals[group] == null) subtotals[group] = { sum: value, firstRow: $(this) };
      else subtotals[group].sum += $.round(value, $.math.settings.decimals);
      subtotals[group].lastRow = $(this);
      if(options.display == $.math.TotalDisplay.OnEachRow) {
        $(this).parent().children(options.setTo).text($.round(subtotals[group].sum, $.math.settings.decimals));
      }
    });
    if(options.display == $.math.TotalDisplay.OnLastRow && options.setTo != null) {
      for(var i in subtotals) {
        $(subtotals[i].lastRow).parent().children(options.setTo).text($.round(subtotals[i].sum, $.math.settings.decimals));
      }
    }
    return this;  
  }
  
  $.fn.subtotal = function(options) { 
    return $(this).total($.extend({ groupBy: '.groupBy', setTo: '.subtotal', display: $.math.TotalDisplay.OnLastRow }, options));
  };
  
  $.fn.runningTotal = function(options) { 
    return $(this).total($.extend({ groupBy: '.groupBy', setTo: '.runningTotal', display: $.math.TotalDisplay.OnEachRow }, options));
  };  
  
})(jQuery);