$(document).ready(function() {
    'use strict';
    //Sidebar Navigation
    $('.button-collapse').sideNav({
        menuWidth: 300, 
    });
    
    
    //Drop Down
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false,
    });
     
        
    //Header Search Box 
    var submitIcon = $('.searchbox-icon');
    var inputBox = $('.searchbox-input');
    var searchBox = $('.searchbox');
    var isOpen = false;
    submitIcon.on('click',function(){
        if(isOpen == false){
            searchBox.addClass('searchbox-open');
            inputBox.focus();
            isOpen = true;
        } else {
            searchBox.removeClass('searchbox-open');
            inputBox.focusout();
            isOpen = false;
        }
    }); 
 
  
    //Dropdown
    $('select').material_select();
    

    //News Main Slider
    $('.xeeSlide').xeeSlide();


    //Header Fix
    $(window).scroll(function(){
        if ($(window).scrollTop()>100){
            $('header').addClass('header-fix');
            $('.wrapper').addClass('margin-top');
        }else{
            $('header').removeClass('header-fix');
            $('.wrapper').removeClass('margin-top');
        }
    });


});
