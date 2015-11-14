/**
 * @package Memory_test
 * @author Vitaliy Pyatin <mail.pyvil@gmail.com>
 */
(function ($, window, document) {
    "use strict";

    /**
     * Class vars
     * @type {string}
     */
    var
        testLinkActive = "active",
        testLinInactive = "disabled";

    /**
     * @param {Object} param
     * @param {Array} param.images Is a array with images name.ext
     * @param {Number|String} [param.level] The level to start, by default = 1
     * @param {Number|String} [param.imagesToRemember] The number of images to remember on the 1-st
     * (or level pass as parameter) level, by default = 2
     * @param {Number|String} [param.levelsAmount] Wanted amount of levels, by default = 10
     * @param {String|Object} [param.levelLinksContainer]
     * @param {String|Object} [param.imagesOutContainer]
     * @param {String|Object} [param.rememberContainer]
     * @constructor
     */
    var Test = function (param) {
        this.start(param);
        this.parameters = param;

        this.levelLinksGenerate();
    };

    /**
     *
     * @type {{toInt: Function, toObj: Function, shuffle: Function, getLevel: Function, nextLevel: Function, setLevel: Function, levelLinksGenerate: Function, getImagesToRemember: Function, getAllImages: Function, successSound: Function, failSound: Function, start: Function}}
     */
    Test.prototype = {
        /**
         * Helper: convert variable to integer value
         * @param _var
         * @returns {number}
         * @param _default
         */
        toInt : function (_var, _default) {
            return (_var == null || _var == 0)
                ? _default : parseInt(_var, 10) ;
        },
        /**
         * Helper: convert variable to Object value
         * @param _var
         * @returns {Object}
         * @param _default
         */
        toObj : function (_var, _default) {
            if (typeof _var == 'String') {
                if ($(_var)) return $(_var);
                if ($('.' + _var)) return $('.' + _var);
                if ($('#' + _var)) return $('#' + _var);
            } else if (typeof _var == 'Object') {
                return $(_var);
            }
            return $(_default);
            //throw new Error("You pass a wrong parameter, please check parameters you pass!");
        },
        /**
         * shuffle current image sequence
         */
        shuffle : function () {
            for(var j, x, i = this.images.length; i; j = Math.floor(Math.random() * i), x = this.images[--i], this.images[i] = this.images[j], this.images[j] = x);
        },
        /**
         * get current level
         * @returns {number}
         */
        getLevel : function() {
            return this.level;
        },
        /**
         * Next level double images to remember
         * and increment current level (cap :D)
         */
        nextLevel : function () {
            this.level += 1;
            this.imagesToRemember *= 2;
            this.levelLinksGenerate();
        },
        /**
         * set level
         * @param {number|string} level
         */
        setLevel : function (level) {
            this.start(this.parameters);
            this.level = this.toInt(level, 1);
            this.imagesToRemember = this.level * 2;
            var imgs = this.getImagesToRemember();
            this.rememberArray = [];
            $(this.rememberContainer).html("");
            var self = this;
            imgs.forEach(function (item) {
                $(self.rememberContainer).append (
                    "<img src = '" + item.item + "' data-id='" + item.id + "'>"
                );
                // push `id`s of elements user have to remember
                self.rememberArray.push(item.id);
            });
            $('.start-test').bind('click', function () {
                $(self.rememberContainer).parent().slideUp('fast', function () {
                    self.getAllImages();
                    $(self.imagesOutContainer).parent().slideDown('fast');
                });
            });
        },
        /**
         * Generate list of levels
         */
        levelLinksGenerate : function () {
            var item = null;
            $(this.levelLinksContainer).html('');
            console.log(this.levelsAmount);
            for (var i = 1; i <= this.levelsAmount; i++)
                $(this.levelLinksContainer).append(
                    "<a href='javascript:void(0)' data-level='"+i+"'>"+i+"</a>"
                );
            var self = this;
            $(this.levelLinksContainer).delegate('a', 'click', function (e) {
                if ($(this).hasClass(testLinInactive)) return false;
                self.setLevel($(this).attr('data-level'));
            });
        },
        /**
         * Get an array of images you have to remember
         * @returns {Array.<T>}
         */
        getImagesToRemember : function () {
            this.shuffle();
            var self = this;
            $(self.levelLinksContainer).parent().slideUp('fast', function () {
                $(self.rememberContainer).parent().slideDown('fast');
            });
            return this.images.slice(0, this.imagesToRemember);
        },
        /**
         *
         */
        getAllImages : function () {
            $(this.imagesOutContainer).html("");
            this.shuffle();
            var self = this;
            this.images.forEach(function (item) {
                $(self.imagesOutContainer).append(
                    "<img src = '" + item.item + "' data-id='" + item.id + "'>"
                );
            });
            var count = this.rememberArray.length;
            console.log(count);
            $(self.imagesOutContainer).undelegate('img', 'click');
            $(self.imagesOutContainer).delegate('img', 'click', function() {
                if (self.rememberArray.indexOf(self.toInt($(this).attr('data-id'), 0)) != -1) {
                    if ($(this).hasClass('check')) return false;
                    $(this).addClass('check');
                    self.sound('check');
                    --count;
                    console.log(count);
                    if (count == 0) {
                        $('.modal').modal('show');
                        $(self.imagesOutContainer).parent().slideUp('fast', function () {
                            self.nextLevel();
                            $(self.levelLinksContainer).parent().slideDown('fast');
                        });
                    }
                } else {
                    if ($(this).hasClass('uncheck')) return false;
                    $(this).addClass('uncheck');
                    self.sound('fail');
                }
            });
        },

        /**
         * When smth happened in app we add a sound
         */
        sound : function (name) {
            var snd = new Howl({
                urls : ['audio/' + name +'.wav'],
                volume : 0.2
            });
            snd.play();
        },

        /**
         * Collect all things app should work with
         * @param param
         */
        start : function (param) {
            /**
             *
             * @type {Array}
             */
            this.images = [];
            var self = this;
            // makes an object of each image, added `path` and `id`
            param.images.forEach(function (item, index) {
                self.images.push({'id' : index, 'item' : item});
            });
            /**
             *
             * @type {number}
             */
            this.level = this.toInt(param.level, 1);
            /**
             *
             * @type {number}
             */
            this.imagesToRemember = this.toInt(param.imagesToRemember, 2);
            /**
             *
             * @type {number}
             */
            this.levelsAmount = this.toInt(param.levelsAmount, 10);
            /**
             *
             * @type {Object}
             */
            this.levelLinksContainer = this.toObj(param.levelLinksContainer, '.pyvil_level_list');
            /**
             *
             * @type {Object}
             */
            this.imagesOutContainer = this.toObj(param.imagesOutContainer, '.pyvil_images_list');
            /**
             *
             * @type {Object}
             */
            this.rememberContainer = this.toObj(param.rememberContainer, '.pyvil_remember_list');

            /**
             * Array of images user have to remember
             * @type {Array}
             */
            this.rememberArray = [];
        }
    };
    /** makes class global */
    window.Test = Test || {};
} (jQuery, window, document) );