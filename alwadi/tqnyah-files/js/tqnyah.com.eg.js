$(document).ready(function () {
	jQuery(".widgetContent ul li a, .chatLinks ul li a, .linksForm ul li a").hover(function() {
	jQuery(this).stop().animate({ textIndent: "5px" }, 1000,'easeOutElastic');
	},function(){
		jQuery(this).stop().animate({ textIndent: "0px" }, 1000,'easeOutElastic');			
	});
	jQuery(".blockLinks ul li a").hover(function() {
	jQuery(this).stop().animate({ textIndent: "25px" }, 1000,'easeOutElastic');
	},function(){
		jQuery(this).stop().animate({ textIndent: "20px" }, 1000,'easeOutElastic');			
	});
	$(".social li").each(function () {
        $("a strong", this).css("opacity", "0");
    });
    $(".social li").hover(function () {
        $(this).stop().fadeTo(500, 1).siblings().stop().fadeTo(500, 0.1);
        $("a strong", this).stop().animate({
            opacity: 1,
            top: "-10px"
        }, 300);
    }, function () {
        $(this).stop().fadeTo(500, 1).siblings().stop().fadeTo(500, 1);
        $("a strong", this).stop().animate({
            opacity: 0,
            top: "-1px"
        }, 300);
    });
});	
$(function () {
    $("img, .log-btn, .copy-right").stop().fadeTo(250, 1);
    $("img, .log-btn, .copy-right").hover(function () {
        $(this).stop().fadeTo(250, 0.6);
    }, function () {
        $(this).stop().fadeTo(250, 1);
    });
	$(document).ready(function() {
		
		var options = {};
	
		if (document.location.search) {
			var array = document.location.search.split('=');
			var param = array[0].replace('?', '');
			var value = array[1];
			
			if (param == 'animation') {
				options.animation = value;
			}
			else if (param == 'type_navigation') {
				if (value == 'dots_preview') {
					$('.border_box').css({'marginBottom': '40px'});
					options['dots'] = true;
					options['preview'] = true;
				}
				else {
					options[value] = true;
					if (value == 'dots') $('.border_box').css({'marginBottom': '40px'});
				}
			}
		}
		
		$('.box_skitter_large').skitter(options);
		
}) ;
jQuery('.gotop').hide();
jQuery(window).scroll(function () {
  if (jQuery(this).scrollTop() > 0) {
		jQuery('.gotop').fadeIn(300);
  } else {
		jQuery('.gotop').fadeOut(300);
  }
});
jQuery('.gotop').click(function () {
		jQuery('body,html').animate({
		scrollTop: 0
  }, 500);
});
	$("#dropmenu ul").css({display: "none"}); // Opera Fix
		$("#dropmenu li").hover(function(){
		$(this).find('ul:first').css({visibility: "visible",display: "none"}).slideDown(468);
		},function(){
		$(this).find('ul:first').css({visibility: "hidden"});
		});
});