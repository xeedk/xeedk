;(function($){
    'use strict';
    $.fn.xeeSlide = function(options) {

        var defaults = {
            mainClassName : 'xeeSlide',
            listPosition : 'right',
            selectionMode : 'click',
            transitionEffect : 'sliding',
            autoSlide : true,
            displayList : true,
            displayControls : false,
            touchControls : true,
            verticalCentering : false,
            adaptiveHeight : false,
            maxHeight : 540,
            beforeSlide : null,
            afterSlide : null,
            adaptiveDuration : 500,
            transitionDuration : 500,
            intervalDuration : 3000
        };

        if (this.length == 0) {
            return this;
        } else if(this.length > 1) {
            this.each(function() {
                $(this).xeeSlide(options);
            });
            return this;
        }

        var xeeSlide = this;
        xeeSlide.plugin = this;
        xeeSlide.data = [];
        xeeSlide.config = {};
        xeeSlide.currentSlide = 0;
        xeeSlide.slideCount = 0;
        xeeSlide.resizeEvent = null;
        xeeSlide.intervalEvent = null;
        xeeSlide.touchFirstPosition = null;
        xeeSlide.transitionInProgress = false;
        xeeSlide.window = $(window);

        // Init
        var init = function() {

            // Merge user options with the default configuration
            xeeSlide.config = $.extend({}, defaults, options);

            // Setup
            setup();

            // Activate interval
            if (xeeSlide.config.autoSlide) {
                activateInterval();
            }

            return true;
        };

        // Get element
        var getElement = function(obj) {
            var element = {};

            // Get link
            var elementLink = obj.find('a').attr('href');
            if ((typeof elementLink != 'undefined') && (elementLink != '')) {
                element.link = elementLink;
                var elementLinkTarget = obj.find('a').attr('target');
                if ((typeof elementLinkTarget != 'undefined') && (elementLinkTarget != '')) {
                    element.linkTarget = elementLinkTarget;
                }
            }

            // Get image
            var elementThumbnail = obj.find('img').attr('src');
            if ((typeof elementThumbnail != 'undefined') && (elementThumbnail != '')) {
                element.thumbnail = elementThumbnail;
            }

            var elementImage = obj.find('img').attr('data-large-src');
            if ((typeof elementImage != 'undefined') && (elementImage != '')) {
                element.image = elementImage;
            }

            // Get title
            var elementSpan = obj.find('span').text();
            if ((typeof elementSpan != 'undefined') && (elementSpan != '') && (elementSpan != null)) {
                element.title = elementSpan;
            } else {
                //var elementTitle = obj.find('img').attr('alt');
                //if ((typeof elementTitle != 'undefined') && (elementTitle != '')) {
                //    element.title = elementTitle;
                //}
            }

             // Get Title
            var elementTitle = obj.find('h2').html(); //alert(varelementTitle);
          //  alert(elementTitle);
             //var elementTitle = obj.find('img').attr('alt');
                if ((typeof elementTitle != 'undefined') && (elementTitle != '')) {
                   element.title = elementTitle;
            }
            // Get description
            var elementDescription = obj.find('p').text();
            //var elementDescription = obj.find('img').attr('data-description');
            if ((typeof elementDescription != 'undefined') && (elementDescription != '')) {
                element.description = elementDescription;
            }

             var elementTime = obj.find('small').text();
             //alert(elementTime);
             if ((typeof elementTime != 'undefined') && (elementTime != '')) {
                element.time = elementTime;
            }

            //var elementDescription = obj.find('img').attr('data-description');
            if ((typeof elementDescription != 'undefined') && (elementDescription != '')) {
                element.description = elementDescription;
            }

            return element;
        };

        // Update the current height


        var updateHeight = function(height, animate) {

            // Check maxHeight
            if (xeeSlide.config.maxHeight) {

                if (xeeSlide.plugin.width() > 480 && height > xeeSlide.config.maxHeight) {

                    height = xeeSlide.config.maxHeight;
                } else if (xeeSlide.plugin.width() <= 480) {
                    if (height + xeeSlide.plugin.find('.ps-list').height() > xeeSlide.config.maxHeight) {
                        height = xeeSlide.config.maxHeight - xeeSlide.plugin.find('.ps-list').height();
                    }
                }
            }

            // Prevents multiple calculations in a short time
            clearTimeout(xeeSlide.resizeEvent);
            xeeSlide.resizeEvent = setTimeout(function() {

                // Adjust right list

               var elementHeight = ((height / xeeSlide.slideCount));
                var elementWidth = (100 / xeeSlide.slideCount);
                xeeSlide.plugin.find('.ps-list > li').css({ width: elementWidth + '%' });

                // Adjust main container
                if (typeof animate != 'undefined' && animate && xeeSlide.config.maxHeight == null) {

                    if (typeof xeeSlide.plugin.find('.ps-current').animate == 'function') {
                        xeeSlide.plugin.find('.ps-current').animate({
                            height: height

                        }, xeeSlide.config.adaptiveDuration, function() {
                            xeeSlide.plugin.find('.ps-list > li').animate({ height: elementHeight }, xeeSlide.config.adaptiveDuration);
                        });
                    } else {
                        xeeSlide.plugin.find('.ps-current').css('height', height);
                        xeeSlide.plugin.find('.ps-list > li').css('height', elementHeight);
                    }

                } else {
                    xeeSlide.plugin.find('.ps-current').css('height', height);
                    xeeSlide.plugin.find('.ps-list > li').css('height', elementHeight);
                }

                // Vertical alignement
                if (xeeSlide.config.verticalCentering) {

                    // List elements
                    xeeSlide.plugin.find('.ps-list > li').each(function(){
                        if ((elementHeight > 50) && ($(this).find('img').height() > elementHeight)) {
                            var imageMargin = Math.round(($(this).find('img').height() - elementHeight) / 2);
                            $(this).find('img').css('margin-top', -imageMargin);

                        } else if ($(this).find('img').height() < elementHeight) {
                            var imageMargin = Math.round((elementHeight - $(this).find('img').height()) / 2);
                            $(this).find('img').css('margin-top', imageMargin);

                        } else {
                            $(this).find('img').css('margin-top', '');
                        }
                    });

                    // Current elements
                    xeeSlide.plugin.find('.ps-current > ul > li').each(function(){
                        var isVisible = ($(this).css('display') == 'none') ? false : true;

                        if (! isVisible) {
                            $(this).show();
                        }

                        if ($(this).show().find('img').height() > height) {
                            var imageMargin = Math.round(($(this).find('img').height() - height) / 2);
                            $(this).find('img').css('margin-top', -imageMargin);

                        } else if ($(this).show().find('img').height() < height) {
                            var imageMargin = Math.round((height - $(this).find('img').height()) / 2);
                            $(this).find('img').css('margin-top', imageMargin);

                        } else {
                            $(this).find('img').css('margin-top', '');
                        }

                        if (! isVisible) {
                            $(this).hide();
                        }
                    });
                }

            }, 100);

            return true;
        };

        // Set size class
        var setSizeClass = function() {

            if (xeeSlide.plugin.width() <= 480) {
                xeeSlide.plugin.addClass('narrow').removeClass('wide');
            } else {
                xeeSlide.plugin.addClass('wide').removeClass('narrow');
            }

            return true;
        };

        // Setup
        var setup = function() {

            // Create container
            xeeSlide.plugin.removeClass(xeeSlide.config.mainClassName).addClass('ps-list');
            xeeSlide.plugin.wrap('<div class="' + xeeSlide.config.mainClassName + '"></div>');
            xeeSlide.plugin = xeeSlide.plugin.parent();
            xeeSlide.plugin.prepend('<div class="ps-current"><ul></ul><span class="ps-caption"></span></div>');
            xeeSlide.slideCount = xeeSlide.plugin.find('.ps-list > li').length;

            if (xeeSlide.slideCount == 0) {
                throw new Error('xeeSlide - No slider item has been found');
                return false;
            }

            // Add controls
            if (xeeSlide.config.displayControls && xeeSlide.slideCount > 1) {
                xeeSlide.plugin.find('.ps-current').prepend('<span class="ps-prev"><span class="ps-prevIcon"></span></span>');
                xeeSlide.plugin.find('.ps-current').append('<span class="ps-next"><span class="ps-nextIcon"></span></span>');
                xeeSlide.plugin.find('.ps-current .ps-prev').on('click',function() {
                    xeeSlide.previousSlide();
                });
                xeeSlide.plugin.find('.ps-current .ps-next').on('click',function() {
                    xeeSlide.nextSlide();
                });
            }

            // Disable list
            if (! xeeSlide.config.displayList) {
                xeeSlide.plugin.find('.ps-current').css('width', '100%');
                xeeSlide.plugin.find('.ps-list').hide();
            }

            // Get slider elements
            var elementId = 1;
            xeeSlide.plugin.find('.ps-list > li').each(function() {
                var element = getElement($(this));
                element.id = elementId;
                xeeSlide.data.push(element);

                $(this).addClass('elt_' + element.id);

                // Check element title
                if (element.title) {
                    if ($(this).find('span').length == 1) {
                        if ($(this).find('span').text() == '') {
                            $(this).find('span').text(element.title);
                        }
                    } else {
                        $(this).find('img').after('<span>' + element.title + '</span>');
                    }
                }

                // Set element in the current list
                var currentElement = $('<li class="elt_' + elementId + '"></li>');

                if (element.image) {
                    currentElement.html('<img src="' + element.image + '" alt="' + (element.title ? element.title : '') + '">');
                } else if (element.thumbnail) {
                    currentElement.html('<img src="' + element.thumbnail + '" alt="' + (element.title ? element.title : '') + '">');
                }

                if (element.link) {
                    currentElement.html('<a href="' + element.link + '"' + (element.linkTarget ? ' target="' + element.linkTarget + '"' : '') + '>' + currentElement.html() + '</a>');
                }

                xeeSlide.plugin.find('.ps-current > ul').append(currentElement);

                // Set selection mode
                if ((xeeSlide.config.selectionMode == 'mouseOver') && (xeeSlide.config.transitionEffect == 'fading')) {
                    $(this).css('cursor', 'default').on('click',function(event) {
                        event.preventDefault();
                    }).bind('mouseenter', function(event) {
                        displayElement(element.id);
                    });
                    $(this).find('a').css('cursor', 'default');
                } else {
                    $(this).css('cursor', 'pointer').on('click',function(event) {
                        event.preventDefault();
                        displayElement(element.id);
                    });
                }

                elementId++;
            });

            // Set list position
            if (xeeSlide.config.listPosition == 'left') {
                xeeSlide.plugin.addClass('listOnTheLeft');
            }

            // Attach slide events
            if (xeeSlide.config.autoSlide) {
                xeeSlide.plugin.on('mouseenter', function() {
                    clearInterval(xeeSlide.intervalEvent);
                    xeeSlide.intervalEvent = null;
                }).on('mouseleave', function() {
                    activateInterval();
                });
            }

            // Display the first element
            displayElement(1);

            // Set the first height
            xeeSlide.plugin.find('.ps-current > ul > li.elt_1 img').on('load', function() {
                setSizeClass();

                var maxHeight = xeeSlide.plugin.find('.ps-current > ul > li.elt_1 img').height();
                updateHeight(maxHeight);

                xeeSlide.window.resize(function() {
                    // The new class must be set before the recalculation of the height.
                    setSizeClass();

                    var maxHeight = xeeSlide.plugin.find('.ps-current > ul > li.elt_' + xeeSlide.currentSlide + ' img').height();
                    updateHeight(maxHeight, xeeSlide.config.adaptiveHeight);
                });
            });

            // Touch controls for current image
            if (xeeSlide.config.touchControls && xeeSlide.slideCount > 1) {

                xeeSlide.plugin.find('.ps-current').on('touchstart', function(e) {
                    try {
                        if (e.originalEvent.touches[0].clientX && xeeSlide.touchFirstPosition == null) {
                            xeeSlide.touchFirstPosition = e.originalEvent.touches[0].clientX;
                        }
                    } catch(e) {
                        xeeSlide.touchFirstPosition = null;
                    }
                });

                xeeSlide.plugin.find('.ps-current').on('touchmove', function(e) {
                    try {
                        if (e.originalEvent.touches[0].clientX && xeeSlide.touchFirstPosition != null) {
                            if (e.originalEvent.touches[0].clientX > (xeeSlide.touchFirstPosition + 50)) {
                                xeeSlide.touchFirstPosition = null;
                                xeeSlide.previousSlide();
                            } else if (e.originalEvent.touches[0].clientX < (xeeSlide.touchFirstPosition - 50)) {
                                xeeSlide.touchFirstPosition = null;
                                xeeSlide.nextSlide();
                            }
                        }
                    } catch(e) {
                        xeeSlide.touchFirstPosition = null;
                    }
                });

                xeeSlide.plugin.find('.ps-current').on('touchend', function(e) {
                    xeeSlide.touchFirstPosition = null;
                });
            }

            return true;
        };

        // Finish element
        var finishElement = function(element) {

            // Element caption
            var elementText = '';

            if (element.time) {
                elementText += '<div class="news-time"><i class="fa fa-clock-o"></i>' + element.time + '</div>';
            }

            if (element.title) {
                elementText += '<h2>'+ element.title + '</h2>';
            }

            if (element.description) {
                if (elementText != '') elementText += '';
                elementText += '<p>'+element.description+'</p>';
            }

            if (elementText != '') {
               // if (element.link) {
                 //   elementText = '<a href="' + element.link + '"' + (element.linkTarget ? ' target="' + element.linkTarget + '"' : '') + '>' + elementText + '</a>';
                // }

                if (typeof xeeSlide.plugin.find('.ps-caption').fadeIn == 'function') {
                    xeeSlide.plugin.find('.ps-caption').html(elementText);
                    xeeSlide.plugin.find('.ps-caption').fadeIn(xeeSlide.config.transitionDuration / 2);
                } else {
                    xeeSlide.plugin.find('.ps-caption').html(elementText);
                    xeeSlide.plugin.find('.ps-caption').show();
                }
            }

            // Slider controls
            if (xeeSlide.config.displayControls) {
                if (typeof xeeSlide.plugin.find('.ps-current > .ps-prev').fadeIn == 'function') {
                    xeeSlide.plugin.find('.ps-current > .ps-prev, .ps-current > .ps-next').fadeIn(xeeSlide.config.transitionDuration / 2);
                } else {
                    xeeSlide.plugin.find('.ps-current > .ps-prev, .ps-current > .ps-next').show();
                }
            }

            // After slide
            if (typeof xeeSlide.config.afterSlide == 'function') {
                xeeSlide.config.afterSlide(element.id);
            }

            // Set the container height
            if (xeeSlide.config.adaptiveHeight) {
                var maxHeight = xeeSlide.plugin.find('.ps-current .elt_' + element.id + ' img').height();
                updateHeight(maxHeight, true);
            }

            return true;
        }

        // Fade an element
        var fadeElement = function(element) {
            var elementContainer = xeeSlide.plugin.find('.ps-current > ul');

            // Update list items
            xeeSlide.plugin.find('.ps-list > li').css('opacity', '0.6');
            xeeSlide.plugin.find('.ps-list > li.elt_' + element.id).css('opacity', '1');

            elementContainer.find('li').not('.elt_' + xeeSlide.currentSlide).not('.elt_' + element.id).each(function(){
                if (typeof $(this).stop == 'function') {
                    $(this).stop();
                }
                $(this).css('position', '').css('z-index', 1).hide();
            });

            // Current element
            if (xeeSlide.currentSlide > 0) {
                var currentElement = elementContainer.find('.elt_' + xeeSlide.currentSlide);

                if (typeof currentElement.animate != 'function') {
                    currentElement.animate = function(css, duration, callback) {
                        currentElement.css(css);
                        if (callback) {
                            callback();
                        }
                    };
                }

                if (typeof currentElement.stop == 'function') {
                    currentElement.stop();
                }

                currentElement.css('position', 'absolute').animate({
                    opacity : 0,
                }, xeeSlide.config.transitionDuration, function() {
                    currentElement.css('position', '').css('z-index', 1).hide();
                });
            }

            // Update current id
            xeeSlide.currentSlide = element.id;

            // Next element
            var nextElement = elementContainer.find('.elt_' + element.id);

            if (typeof nextElement.animate != 'function') {
                nextElement.animate = function(css, duration, callback) {
                    nextElement.css(css);
                    if (callback) {
                        callback();
                    }
                };
            }

            if (typeof nextElement.stop == 'function') {
                nextElement.stop();
            }

            nextElement.css('position', 'absolute').show().animate({
                opacity : 1,
            }, xeeSlide.config.transitionDuration, function() {
                nextElement.css('position', '').css('z-index', 2).show();
                finishElement(element);
            });

            return true;
        }

        // Slide an element
        var slideElement = function(element, direction) {
            var elementContainer = xeeSlide.plugin.find('.ps-current > ul');

            if (typeof direction == 'undefined') {
                direction = 'left';
            }

            if (xeeSlide.currentSlide == 0) {
                elementContainer.find('.elt_1').css({
                    position : '',
                    left : '',
                    opacity : 1,
                    'z-index' : 2
                }).show();
                xeeSlide.plugin.find('.ps-list > li.elt_1').css('opacity', '1');
                finishElement(element);

            } else {

                if (xeeSlide.transitionInProgress) {
                    return false;
                }

                xeeSlide.transitionInProgress = true;

                // Get direction details
                var elementWidth = elementContainer.width();

                if (direction == 'left') {
                    var elementDest = -elementWidth;
                    var nextOrigin = elementWidth;
                } else {
                    var elementDest = elementWidth;
                    var nextOrigin = -elementWidth;
                }

                var currentElement = elementContainer.find('.elt_' + xeeSlide.currentSlide);

                if (typeof currentElement.animate != 'function') {
                    currentElement.animate = function(css, duration, callback) {
                        currentElement.css(css);
                        if (callback) {
                            callback();
                        }
                    };
                }

                currentElement.css('position', 'absolute').animate({
                    left : elementDest,
                }, xeeSlide.config.transitionDuration, function() {
                    currentElement.css('position', '').css('z-index', 1).css('left', '').css('opacity', 0).hide();
                });

                // Next element
                var nextElement = elementContainer.find('.elt_' + element.id);

                if (typeof nextElement.animate != 'function') {
                    nextElement.animate = function(css, duration, callback) {
                        nextElement.css(css);
                        if (callback) {
                            callback();
                        }
                    };
                }

                nextElement.css('position', 'absolute').css('left', nextOrigin).css('opacity', 1).show().animate({
                    left : 0,
                }, xeeSlide.config.transitionDuration, function() {
                    nextElement.css('position', '').css('left', '').css('z-index', 2).show();
                    xeeSlide.transitionInProgress = false;

                    // Display new element
                    xeeSlide.plugin.find('.ps-list > li').css('opacity', '0.6');
                    xeeSlide.plugin.find('.ps-list > li.elt_' + element.id).css('opacity', '1');

                    finishElement(element);
                });
            }

            // Update current id
            xeeSlide.currentSlide = element.id;

            return true;
        }

        // Display the current element
        var displayElement = function(elementId, apiController, direction) {

            if (elementId == xeeSlide.currentSlide) {
                return false;
            }

            var element = xeeSlide.data[elementId - 1];

            if (typeof element == 'undefined') {
                throw new Error('xeeSlide - The element ' + elementId + ' is undefined');
                return false;
            }

            if (typeof direction == 'undefined') {
                direction = 'left';
            }

            // Before slide
            if (typeof xeeSlide.config.beforeSlide == 'function') {
                xeeSlide.config.beforeSlide(elementId);
            }

            if (typeof xeeSlide.plugin.find('.ps-caption').fadeOut == 'function') {
                //xeeSlide.plugin.find('.ps-caption, .ps-prev, .ps-next').fadeOut(xeeSlide.config.transitionDuration / 2);

            } else {
                //xeeSlide.plugin.find('.ps-caption, .ps-prev, .ps-next').hide();
            }

            // Choose the transition effect
            if (xeeSlide.config.transitionEffect == 'sliding') {
                slideElement(element, direction);
            } else {
                fadeElement(element);
            }

            // Reset interval to avoid a half interval after an API control
            if (typeof apiController != 'undefined' && xeeSlide.config.autoSlide) {
                activateInterval();
            }

            return true;
        };

        // Activate interval
        var activateInterval = function() {
            clearInterval(xeeSlide.intervalEvent);

            if (xeeSlide.slideCount > 1 && xeeSlide.config.autoSlide) {
                xeeSlide.intervalEvent = setInterval(function() {
                    if (xeeSlide.currentSlide + 1 <= xeeSlide.slideCount) {
                        var nextItem = xeeSlide.currentSlide + 1;
                    } else {
                        var nextItem = 1;
                    }
                    displayElement(nextItem);
                }, xeeSlide.config.intervalDuration);
            }

            return true;
        };

        // Start auto slide
        xeeSlide.startSlide = function() {
            xeeSlide.config.autoSlide = true;
            activateInterval();
            return true;
        };

        // Stop auto slide
        xeeSlide.stopSlide = function() {
            xeeSlide.config.autoSlide = false;
            clearInterval(xeeSlide.intervalEvent);
            return true;
        };

        // Get current slide
        xeeSlide.getCurrentSlide = function() {
            return xeeSlide.currentSlide;
        };

        // Get slide count
        xeeSlide.getSlideCount = function() {
            return xeeSlide.slideCount;
        };

        // Display slide
        xeeSlide.displaySlide = function(itemId) {
            displayElement(itemId, true);
            return true;
        };

        // Next slide
        xeeSlide.nextSlide = function() {
            if (xeeSlide.currentSlide + 1 <= xeeSlide.slideCount) {
                var nextItem = xeeSlide.currentSlide + 1;
            } else {
                var nextItem = 1;
            }
            displayElement(nextItem, true, 'left');
            return true;
        };

        // Previous slide
        xeeSlide.previousSlide = function() {
            if (xeeSlide.currentSlide - 1 >= 1) {
                var previousItem = xeeSlide.currentSlide - 1;
            } else {
                var previousItem = xeeSlide.slideCount;
            }
            displayElement(previousItem, true, 'right');
            return true;
        };

        // Destroy slider
        xeeSlide.destroy = function(soft) {
            clearInterval(xeeSlide.intervalEvent);

            if (typeof soft != 'undefined') {
                xeeSlide.plugin.find('.ps-list > li').each(function() {
                    $(this).attr('style', null).removeClass().css('cursor', '').unbind('click').unbind('mouseenter');
                    $(this).find('a').css('cursor', '');
                    $(this).find('img').attr('style', null);
                });

                xeeSlide.plugin.find('.ps-list').addClass(xeeSlide.config.mainClassName).removeClass('ps-list');
                xeeSlide.plugin.find('.ps-current').unwrap().remove();
                xeeSlide.hide();

            } else {
                xeeSlide.parent().remove();
            }

            xeeSlide.plugin = null;
            xeeSlide.data = [];
            xeeSlide.config = {};
            xeeSlide.currentSlide = 0;
            xeeSlide.slideCount = 0;
            xeeSlide.resizeEvent = null;
            xeeSlide.intervalEvent = null;
            xeeSlide.touchFirstPosition = null;
            xeeSlide.transitionInProgress = false;
            xeeSlide.window = null;

            return true;
        };

        // Reload slider
        xeeSlide.reload = function(newOptions) {
            xeeSlide.destroy(true);

            xeeSlide = this;
            xeeSlide.plugin = this;
            xeeSlide.window = $(window);
            xeeSlide.plugin.show();

            // Merge new options with the default configuration
            xeeSlide.config = $.extend({}, defaults, newOptions);

            // Setup
            setup();

            // Activate interval
            if (xeeSlide.config.autoSlide) {
                activateInterval();
            }

            return true;
        };

        // Slider initialization
        init();

        return this;
    }
})(window.Zepto || window.jQuery);
