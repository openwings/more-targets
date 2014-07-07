/**
    * @description render more targets selection
    * @author yuhao@taobao.com
    * @param {string} domId like #J_moreTargets  trigger of show plugin
    * @param {object} data like {pv: [{aPv: 'a浏览量', checked: true}, {bPv: 'b浏览量', checked: false}]}
    * @param {object} opts options of groups/selectors/events binding
    * @example Array data demo
    * [
        {name: '扫码量', key: 'scanNum', checked: true},
        {name: '访客数', key: 'uv', checked: true},
        {name: '扫码关注量', key: 'scanGuanZhu', checked: true},
        {name: '优惠券发放量', key: 'YouHuiQuanFaFangLiang', checked: true},
        {name: '优惠券领取量', key: 'YouHuiQuanLingQuLiang', checked: true},
        {name: '优惠券使用量', key: 'YouHuiQuanShiYongLiang', checked: true},
        {name: '分会场排名', key: 'FenHuiChangPaiMing', checked: false}
    ]
    * @example JSON data demo
    *  {
    fwsj: {
        name: '访问数据',
        checked: false,
        children: [
            {landingPv: {name: '到达页浏览量', checked: true}},
            {rdtsl: {name: '入店跳失率', checked: false}}
        ]
    },
    zhsj: {
        name: '转化数据',
        checked: false,
        children: [
            {alipayTradeNum: {name: '拍下件数', checked: true}},
            {alipayTradeNum2: {name: '拍下笔数', checked: false}},
            {alipayTradeAmt: {name: '拍下金额', checked: false}},
            {collection: {name: '收藏量', checked: true}},
            {auctionCollection: {name: '宝贝收藏量', checked: false}},
            {shopCollection: {name: '店铺收藏量', checked: false}},
            {cartAdd: {name: '添加到购物车量', checked: false}}
        ]
    }
    }

    renderMoreTargets('#J_moreTargets', [
            {name: '扫码量', key: 'scanNum', checked: true},
            {name: '访客数', key: 'uv', checked: true},
            {name: '扫码关注量', key: 'scanGuanZhu', checked: true},
            {name: '优惠券发放量', key: 'YouHuiQuanFaFangLiang', checked: true},
            {name: '优惠券领取量', key: 'YouHuiQuanLingQuLiang', checked: true},
            {name: '优惠券使用量', key: 'YouHuiQuanShiYongLiang', checked: true}
        ], {
        submitButtonClick: function (r, d) {
            console.warn(r, d, '   in use define submit button click event');
            reRenderSummary(r);
        },
        eachCheckBoxClick: function (t, checked) {
            console.warn(t, checked, '   in use define each input check box click event');
        },
        overlay: false,
        min: 1,
        max: 6,
        onHideRemove: false
        }, function () {
            console.warn('rendered');
        });
    * @param {function} cb callback when rendered
**/
~function () {
    var moreTargets = function (domId, data, opts, cb) {
        var emptyFuc = function () {};
        if ($(domId).length != 1 || $.isEmptyObject(data)) return;
        var options = $.extend({
            //properties
            id: $(domId),
            width: '400px',
            cssClass: 'default',
            //styles
            cssStyle: '',
            overlayAlpha: 0.5,
            fixed: false,
            overlayColor: 'black',
            overlayZIndex: 10001,
            layerZIndex: 10002,
            //events
            triggerShowEventType: 'click',
            submitButtonClick: '',
            cancelButtonClick: '',
            eachCheckBoxClick: '',
            //User Experience
            //最少选择一个，0为不限， > 0即为开启，如果开启此参数，请注意更新超限提示参数minMessage
            min: 0,
            minMessage: '最少需要选择{min}个选项，请重新选择',
            //最多可选数，0为不限，> 0即为开启，如果开启此参数，请注意更新超限提示参数maxMessage
            max: 0,
            maxMessage: '最多只能选择{max}个选项，请重新选择',
            afterSubmitHide: true,
            //TODO
            //clickBodyHide: true,
            hasSelectAll: true,
            hasSubmitAndCancelButtons: true,
            hasSelectGroup: true,
            onHideRemove: true,
            overlay: true,
            //如果开启hasTitle，请注意更新title参数
            hasTitle: true,
            title: '请选择您需要查看的指标，可多选',
            //TODO
            //debug: false,
            closable: true,
            closeText: 'x'
        }, opts);
        options = $.extend(options, {
            //uuidDom: '<div id="indexPanel" class="moreTargets"></div>',
            _defaultTitleDom: '<div class="moreTargetsTitle">{{title}}<span class="moreTargetsClose"></span></div>',
            _defaultAllCheckDom: '<h2 class="fline"><label><input class="J_checkedAll" type="checkbox">全选/全不选</label></h2>',
            _defaultSubmitDom: '<div class="btnWrapper"><label><input type="submit" value="确定" class="btnSubmit"></label><label><input type="submit" value="取消" class="btnCancel"></label></div>',
            _autoIncrementID: new Date().getTime()
        });
        //console.warn(options, '   after twice extend');
        var methods = {
            opts: options,
            init: function () {
                var me = this,
                    o = this.opts;
                o.id.unbind(o.triggerShowEventType + '.triggerMoreTarget').bind(o.triggerShowEventType + '.triggerMoreTarget', function (event) {
                    //console.warn(o._renderedFlag, event, '   event object in trigger');
                    if (o._renderedFlag === true) {
                        me.show();
                    } else {
                        //console.warn('re render', me.getDom());
                        //first init need append DOM, after cancel button clicked call this.show and this.hide methods
                        me.render(event);

                    }
                });
            },
            /**
                * @param {event object} event
                */
            render: function (event) {
                //if (me.getDom().length) return;
                //console.warn('render function');
                var o = this.opts, renderDom = '';
                // set private renderedFlag
                if (!o.onHideRemove) {
                    o._renderedFlag = true;
                }

                if (this.myTypeOf(data, 'Array')) {//same as $.isArray
                    renderDom = (this.handleArray(data)).join('');
                } else {
                    //console.warn((this.handleJSON(data)).join(' '), '   call handleJSON function');
                    renderDom = (this.handleJSON(data)).join('');
                }
                //handle opts
                o.uuidDom = this.createWrapper();
                //console.warn(o.uuidDom, renderDom);
                //set user class name
                if (o.cssClass !== '') {
                    o.uuidDom.addClass(o.cssClass);
                }
                $('body').append(this.getDom().empty().append(renderDom));
                // attention: Chrome get compttued style without DOM Tree will be empty return 0
                // so must append first, set position secondiary
                this.setPosition(event);
                if (o.overlay === true) {
                    this.createOverlay();
                }
                this.eventsBind();
            },
            eventsBind: function () {
                //console.warn('call events bind method');
                var o = this.opts;
                var me = this;
                //bind select all method
                if (o.hasSelectAll) {
                    me.getDom().delegate('input.J_checkedAll', 'click.selectAllBoxes', function () {
                        //console.warn(this);
                        me.getDom().find('input:checkbox').prop('checked', this.checked ? true : false);
                    });
                }
                //bind select group method
                if (o.hasSelectGroup) {
                    me.getDom().delegate('input.J_selectGroup', 'click.selectGroupBoxes', function () {
                        //console.warn(this);
                        me.getDom().find('ul.J_groupName[data-group='+ $(this).data('group') +']').find('input:checkbox').prop('checked', this.checked ? true : false);
                    });
                }
                me.getDom().delegate('ul.J_groupName input:checkbox', 'click.eachInputCheckBoxClick', function (event) {
                    if (me.myTypeOf(o.eachCheckBoxClick, 'Function')) {
                        o.eachCheckBoxClick(this, this.checked, event);
                    }
                });
                me.getDom().delegate('input.btnCancel', 'click.cancelSelectWrap', function (event) {
                    me.hide();
                    if (me.myTypeOf(o.cancelButtonClick, 'Function')) {
                        o.cancelButtonClick(this, event);
                    }
                });
                me.getDom().delegate('input.btnSubmit', 'click.submitButtonClick', function (event) {
                    var returnHashMap = {
                        selectted: me.getDom().find('ul input:checked'),
                        unSelect: me.getDom().find('ul input').not(':checked'),
                        selecttedArray: me.getDom().find('ul input:checked').toArray()
                        /*
                        selecttedKeys: ,
                        selecttedMap: []
                        */
                    };
                    var selecttedKeys = [], selecttedName = [];
                    for (var i = 0, l = returnHashMap.selecttedArray.length; i < l; i++) {
                        selecttedKeys.push( $(returnHashMap.selecttedArray[i]).data('key') );
                        selecttedName.push( $(returnHashMap.selecttedArray[i]).data('name') );
                    }
                    returnHashMap.selecttedKeys = selecttedKeys;
                    if (o.max > 0 && returnHashMap.selecttedKeys.length > o.max) {
                        alert(o.maxMessage.replace('{max}', o.max));
                        return;
                    }
                    if (o.min > 0 && returnHashMap.selecttedKeys.length < o.min) {
                        alert(o.minMessage.replace('{min}', o.min));
                        return;
                    }
                    returnHashMap.selecttedName = selecttedName;
                    if (o.afterSubmitHide === true) {
                        me.hide();
                    }
                    if (me.myTypeOf(o.submitButtonClick, 'Function')) {
                        o.submitButtonClick(returnHashMap, me.getDom(), event);
                    }
                });
            },
            show: function () {
                //console.warn(this.getDom(), '    in this.show function');
                this.getDom().show();
                if (this.opts.overlay === true) {
                    $('div.moreTargetsOverlay').hide();
                }
            },
            destroy: function () {
                this.getDom().remove();
                // clean closure require
                delete this.opts.uuidDom;
                if (this.opts.overlay === true) {
                    $('div.moreTargetsOverlay').remove();
                }
            },
            hide: function () {
                if (this.opts.onHideRemove) {
                    this.destroy();
                    this.opts._renderedFlag = false;
                //console.warn(this.getDom(), $('div.moreTargetsOverlay'), '   remove in hide method');
                } else {
                    this.getDom().hide();
                    if (this.opts.overlay === true) {
                        $('div.moreTargetsOverlay').hide();
                    }
                    this.opts._renderedFlag = true;
                }
            },
            createWrapper: function () {
                var uuidDom = $('<div class="moreTargets">').attr('id', 'J_moreTargets' + (new Date()).getTime());
                return this.setStyles(uuidDom);
            },
            getDom: function () {
                return this.opts.uuidDom;
            },
            setStyles: function (uDom) {
                var o = this.opts;
                //set inline styles from options
                if (o.cssStyle) {
                    if (typeof o.cssStyle === 'object') {
                        uDom.css(o.cssStyle);
                    } else if (typeof o.cssStyle === 'string') {
                        uDom.attr('style', o.cssStyle);
                    }
                }
                //set some configs from options
                uDom.css({
                    zIndex: o.layerZIndex
                });
                //console.warn(uDom, '     uuid DOM in setStyles');
                return uDom;
            },
            handleArray: function (dataArray) {
                var inputs = [], opts = this.opts;
                for (var i = 0, l = dataArray.length; i < l; i++) {
                    var c = dataArray[i];
                    inputs.push( '<li><label><input type="checkbox" data-name="'+ c.name.replace('<', '&lt') +'" data-key="'+ c.key +'" '+
                        (c.checked ?
                            'checked="checked"' :
                            '') +' /> '+ c.name +'</label></li>' );
                    //console.warn(k2, c, '   in three deep for');
                }
                inputs.unshift( '<ul class="J_groupName">' );
                inputs.push( '</ul>' );
                if (opts.hasSelectAll === true) {
                    inputs.push( opts._defaultAllCheckDom );
                }
                if (opts.hasTitle === true) {
                    inputs.unshift( opts._defaultTitleDom.replace('{{title}}', opts.title) );
                }
                if (opts.hasSubmitAndCancelButtons === true) {
                    //add submit and cancel buttons
                    inputs.push( opts._defaultSubmitDom );
                }
                //console.warn(inputs, '    in handleArray');
                return inputs;

            },
            handleJSON: function (dataJSON) {
                var groups = [];
                var opts = this.opts;
                for (var k in dataJSON) {
                    var o = dataJSON[k], inputs = [];
                    //console.warn(k, o, '   data k and value');
                    groups.push( '<h2><label>' +
                        (o.hasChecked === false ?
                            '' :
                            '<input type="checkbox" class="J_selectGroup" ' +
                            (o.checked ? 'checked="checked"'
                            : '') +
                            ' data-group="'+ k +'" /> ') + o.name + '</label></h2>' );
                    for (var i = 0, l = o.children.length; i < l; i++) {
                        var c = o.children[i];
                        //console.warn(c, '   o s children');
                        for (var k2 in c) {
                            inputs.push( '<li><label><input type="checkbox" data-name="'+ c[k2].name.replace('<', '&gt') +'" data-key="'+ k2 +'" '+
                                (c[k2].checked || o.checked ?
                                    'checked="checked"' :
                                    '') +' /> '+ c[k2].name +'</label></li>' );
                            //console.warn(k2, c, '   in three deep for');
                        }
                    }
                    inputs.unshift( '<ul class="J_groupName" data-group="' + k + '">' );
                    inputs.push( '</ul>' );
                    groups.push( inputs.join('') );
                }
                if (opts.hasSelectAll === true) {
                    groups.push( opts._defaultAllCheckDom );
                }
                if (opts.hasTitle === true) {
                    groups.unshift( opts._defaultTitleDom.replace('{{title}}', opts.title) );
                }
                if (opts.hasSubmitAndCancelButtons === true) {
                    //add submit and cancel buttons
                    groups.push( opts._defaultSubmitDom );
                }
                //console.warn(groups, '    in handleJSON');
                return groups;
            },
            /*
            checkGroupSelect: function (checked, groupKey) {
                this.getDom().find('ul.J_groupName[data-group="'+ gourpKey +'"] input').prop('checked', checked ? true : false);
            },
            */
            close: function () {
            },
            createOverlay: function () {
                var opts = this.opts;
                var size = this.getMaxScreenOffset();
                $('<div class="moreTargetsOverlay">')
                .css({
                    zIndex: opts.overlayZIndex,
                    backgroundColor: opts.overlayColor,
                    opacity: opts.overlayAlpha,
                    width: size.width,
                    //这里要注意，如果异步加载DOM会导致高度获取异常，需要在DOM加载改变完成页面高度之后调用创建才可以保证正确覆盖全页面，TODO:使用jQuery iframe插件覆盖表单兼容IE6/7
                    height: size.height
                })
                .appendTo('body');
                //console.warn($('div.moreTargetsOverlay'), '   overlay creatted');
            },
            setClassName: function () {
                this.getDom().addClass(this.opts.cssClass);
            },
            setCloseText: function () {
            },
            /**
                * @param {event object} e
                **/
            setPosition: function (e) {
                var me = this,
                    o = me.opts;
                if (o.fixed === true) {
                    var marginLeft = '-' + Math.round(me.getDom().width() / 2) + 'px',
                        marginTop = '-' + Math.round(me.getDom().height() / 2) + 'px';
                    //console.warn([marginLeft, marginTop].join(' '));
                    me.getDom().css({
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        margin: [marginTop, 0, 0, marginLeft].join(' ')
                    });
                } else {
                    var triggerOffset = o.id.offset(),
                        size = me.getMaxScreenOffset();
                    me.getDom().css({
                        top: triggerOffset.top + o.id.height(),
                        left: me.getDom().width() + triggerOffset.left > size.width ? triggerOffset.left - me.getDom().width() : triggerOffset.left
                    });
                    //console.warn(o.id.offset(), size);
                }
            },
            getMaxScreenOffset: function () {
                var d = document,
                    db = d.body,
                    dd = d.documentElement;
                return {
                    width: Math.max(db.clientWidth, dd.clientWidth),
                    height: Math.max(db.clientHeight, dd.clientHeight)
                };
            },
            myTypeOf: function (saw, com) {
                return Object.prototype.toString.call(saw).slice(8, -1) === com;
            }
        };
        methods.init();
        if (methods.myTypeOf(cb, 'Function')) {
            cb();
        }
    }
    window.moreTargets = moreTargets;
}();
