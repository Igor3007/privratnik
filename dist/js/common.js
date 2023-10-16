document.addEventListener("DOMContentLoaded", function (event) {

    const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?apikey=0e2d85e0-7f40-4425-aab6-ff6d922bb371&suggest_apikey=ad5015b5-5f39-4ba3-9731-a83afcecb740&lang=ru_RU&mode=debug';


    /* =================================================
    load ymaps api
    =================================================*/

    window.loadApiYmaps = function (callback) {

        if (window.ymaps == undefined) {
            const script = document.createElement('script')
            script.src = API_YMAPS
            script.onload = () => {
                callback(window.ymaps)
            }
            document.head.append(script)
        } else {
            callback(window.ymaps)
        }

    }

    /* =================================================
    table sort example
    =================================================*/

    if (document.querySelector('.table__sort')) {
        document.querySelectorAll('.table__sort').forEach(item => {
            item.parentNode.classList.add('table__th--sort')
            item.parentNode.addEventListener('click', (e) => {
                item.classList.toggle('table__sort--up')
                e.target.closest('.table__th').classList.toggle('is-active')
            })
        })
    }

    /* =================================================
    submenu
    =================================================*/

    if (document.querySelector('.is-sub-menu')) {
        const items = document.querySelectorAll('.is-sub-menu')

        items.forEach(item => {
            item.addEventListener('click', e => {
                if (item.closest('.is-sub-menu')) {
                    e.preventDefault()
                }

                item.classList.toggle('is-open')
            })

            if (item.querySelector('.sub-menu')) {
                item.querySelector('.sub-menu').addEventListener('click', e => {
                    e.stopPropagation()
                })
            }
        })
    }

    /* =================================================
    preloader
    ================================================= */

    class Preloader {

        constructor() {
            this.$el = this.init()
            this.state = false
        }

        init() {
            const el = document.createElement('div')
            el.classList.add('loading')
            el.innerHTML = '<div class="indeterminate"></div>';
            document.body.append(el)
            return el;
        }

        load() {

            this.state = true;

            setTimeout(() => {
                if (this.state) this.$el.classList.add('load')
            }, 300)
        }

        stop() {

            this.state = false;

            setTimeout(() => {
                if (this.$el.classList.contains('load'))
                    this.$el.classList.remove('load')
            }, 200)
        }

    }

    window.preloader = new Preloader();


    /* =================================================
    confirm
    ================================================= */


    class Dialog {

        constructor() {
            this.i = 0
        }

        topStatusRevert(params) {
            const template = `
                <div class="af-dialog-revert" >
                    <div class="af-dialog-revert__msg" >${params.revertText}</div>
                    <div class="af-dialog-revert__btn" >Отменить</div>
                    <div class="af-dialog-revert__close" ></div>
                </div>
            `

            function hideMSG(elementStatus) {
                elementStatus.classList.add('af-dialog-revert--hide')
                setTimeout(() => {
                    elementStatus.remove()
                }, 500)
            }

            const elementStatus = document.createElement('div')
            elementStatus.innerHTML = template;

            const timer = setTimeout(() => {
                params.onConfirm()
                //hideMSG(elementStatus)
            }, 5000)

            if (elementStatus.querySelector('.af-dialog-revert__btn')) {
                elementStatus.querySelector('.af-dialog-revert__btn').addEventListener('click', e => {
                    clearTimeout(timer)
                    this.revertElement(params.removeHtmlElem)
                    hideMSG(elementStatus)
                })
            }

            document.body.append(elementStatus)



        }

        getTemplate(data) {
            return `
                <div class="af-dialog" >
                    <div class="af-dialog__title" >${data.title}</div>
                    <div class="af-dialog__desc" >${data.desc}</div>
                    <div class="af-dialog__action" >
                        <div class="af-dialog__apply" disabled="disabled" >Да, удалить <span>(5 сек)</span></div>
                        <div class="af-dialog__cancel" >Отмена</div>
                    </div>
                </div>
            `;
        }

        hideElement(elem) {
            elem.style.opacity = 0
            elem.style.transition = '0.5s ease'
            setTimeout(() => {
                elem.style.display = 'none'
            }, 600)
        }

        revertElement(elem) {
            elem.style.opacity = 1
            setTimeout(() => {
                elem.style.removeProperty('display');
            }, 600)
        }

        startTimer(duration, display) {
            let timer = duration,
                minutes, seconds;
            let instanceTimer = setInterval(() => {

                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                //seconds = seconds < 10 ? "0" + seconds : seconds;

                display.textContent = '(' + (minutes == '00' ? '' : minutes + ":") + seconds + ' сек)';

                if (--timer < 0) {
                    clearInterval(instanceTimer)
                    display.parentNode.removeAttribute('disabled')
                    display.remove()
                }
            }, 1000);
        }

        remove(params) {

            const popupDialog = new afLightbox({
                mobileInBottom: true
            })

            popupDialog.open(this.getTemplate(params), (instance) => {

                const buttonApply = instance.querySelector('.af-dialog__apply')
                const buttonCancle = instance.querySelector('.af-dialog__cancel')
                this.startTimer(5, buttonApply.querySelector('span'))

                buttonApply.addEventListener('click', e => {
                    this.hideElement(params.removeHtmlElem)
                    this.topStatusRevert(params)
                    popupDialog.close()
                })

                buttonCancle.addEventListener('click', e => popupDialog.close())

            })

        }

    }

    window.dialog = new Dialog()

    document.querySelectorAll('[data-parking="remove"]').forEach(item => {
        item.addEventListener('click', e => {
            window.dialog.remove({
                removeHtmlElem: item.closest('.table__tr'),
                title: 'Удаление парковки',
                desc: 'Внимание! Вы уверены, что хотите удалить парковку «Парковка 2» со всеми добавленными к ней данными и доступами?',
                revertText: 'Вы удалили парковку «Парковка 2»',
                onConfirm: function () {
                    //ajax request for remove
                    console.log('удалено')
                }
            })
        })
    })

    document.querySelectorAll('[data-script="remove"]').forEach(item => {
        item.addEventListener('click', e => {
            window.dialog.remove({
                removeHtmlElem: item.closest('.table__tr'),
                title: 'Удаление сценария',
                desc: 'Внимание! Вы уверены, что хотите удалить сценарий «Сценария для жильцов» со всеми добавленными к нему правами доступа для пользователей?',
                revertText: 'Вы удалили сценарий ««Сценарий для жильцов»',
                onConfirm: function () {
                    //ajax request for remove
                    console.log('удалено')
                }
            })
        })
    })

    document.querySelectorAll('[data-group="remove"]').forEach(item => {
        item.addEventListener('click', e => {
            window.dialog.remove({
                removeHtmlElem: item.closest('.table__tr'),
                title: 'Удаление группы',
                desc: 'Внимание! Вы уверены, что хотите удалить группу «Группа 2»? Все пользователи группы будут автоматически перенесены в «Общую группу».',
                revertText: 'Вы удалили группу «Группа 2»',
                onConfirm: function () {
                    //ajax request for remove
                    console.log('удалено')
                }
            })
        })
    })

    document.querySelectorAll('[data-rights="remove"]').forEach(item => {
        item.addEventListener('click', e => {
            window.dialog.remove({
                removeHtmlElem: item.closest('.table__tr'),
                title: 'Удаление прав доступа',
                desc: 'Внимание! Вы уверены, что хотите удалить сценарий «Сценарий для жильцов» у пользователя/группы пользователей «Добрынина Валерия»?',
                revertText: 'Вы удалили права доступа.',
                onConfirm: function () {
                    //ajax request for remove
                    console.log('удалено')
                }
            })
        })
    })

    document.querySelectorAll('[data-users="remove"]').forEach(item => {
        item.addEventListener('click', e => {
            window.dialog.remove({
                removeHtmlElem: item.closest('.table__tr'),
                title: 'Удаление пользователя',
                desc: 'Внимание! Вы уверены, что хотите удалить пользователя Тестовый Михайл?',
                revertText: 'Вы удалили пользователя Тестовый Михаил.',
                onConfirm: function () {
                    //ajax request for remove
                    console.log('удалено')
                }
            })
        })
    })


    /* ==============================================
    mobile menu
    ============================================== */

    if (document.querySelector('.page-scroll-top')) {

        const btnPageScrollTop = document.querySelector('.page-scroll-top')

        btnPageScrollTop.addEventListener('click', e => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        })

        window.addEventListener('scroll', e => {
            if (document.documentElement.scrollTop > 300) {
                btnPageScrollTop.classList.add('is-active')
            } else {
                if (btnPageScrollTop.classList.contains('is-active')) btnPageScrollTop.classList.remove('is-active')
            }
        })
    }

    /* ==============================================
    mobile menu
    ============================================== */

    // if (document.querySelector('[data-menu="open"]')) {
    //     const elContainer = document.querySelector('[data-menu="container"]')
    //     const elButton = document.querySelector('[data-menu="btn"]')

    //     function mobileMenu(params) {
    //         this.el = params.elContainer;
    //         this.button = params.elButton;
    //         this.state = 'close';

    //         this.open = function () {

    //             this.el.classList.add('open')
    //             this.button.classList.add('open')
    //             document.body.classList.add('hidden')
    //             this.state = 'open';

    //         }

    //         this.close = function () {

    //             this.el.classList.add('close-animate')
    //             this.button.classList.remove('open')


    //             setTimeout(() => {
    //                 this.el.classList.remove('open')
    //                 this.el.classList.remove('close-animate')
    //                 document.body.classList.remove('hidden')
    //                 this.state = 'close'
    //             }, 200)


    //         }

    //         this.toggle = function () {
    //             if (this.state == 'close') this.open()
    //             else this.close()
    //         }
    //     }

    //     window.menuinstance = new mobileMenu({
    //         elButton,
    //         elContainer
    //     })


    // }

    if (document.querySelector('[data-menu="open"]')) {
        const btnBurger = document.querySelector('[data-menu="open"]')
        const menuBurger = document.querySelector('.page-personal__aside')

        btnBurger.addEventListener('click', e => {
            btnBurger.classList.toggle('open')
            menuBurger.classList.toggle('is-open')
            document.body.classList.toggle('page-hidden')
        })
    }


    /* ==============================================
    Status
    ============================================== */

    function Status() {

        this.containerElem = '#status'
        this.headerElem = '#status_header'
        this.msgElem = '#status_msg'
        this.btnElem = '#status_btn'
        this.timeOut = 10000,
            this.autoHide = true

        this.init = function () {
            let elem = document.createElement('div')
            elem.setAttribute('id', 'status')
            elem.innerHTML = '<div id="status_header"></div> <div id="status_msg"></div><div id="status_btn"></div>'
            document.body.append(elem)

            document.querySelector(this.btnElem).addEventListener('click', function () {
                this.parentNode.setAttribute('class', '')
            })
        }

        this.msg = function (_msg, _header) {
            _header = (_header ? _header : 'Отлично!')
            this.onShow('complete', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.err = function (_msg, _header) {
            _header = (_header ? _header : 'Ошибка')
            this.onShow('error', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.wrn = function (_msg, _header) {
            _header = (_header ? _header : 'Внимание')
            this.onShow('warning', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }

        this.onShow = function (_type, _header, _msg) {
            document.querySelector(this.headerElem).innerText = _header
            document.querySelector(this.msgElem).innerText = _msg
            document.querySelector(this.containerElem).classList.add(_type)
        }

        this.onHide = function () {
            setTimeout(() => {
                document.querySelector(this.containerElem).setAttribute('class', '')
            }, this.timeOut);
        }

    }

    window.STATUS = new Status();
    const STATUS = window.STATUS;
    STATUS.init();

    /********************************************
     * ajax request
     ********************************************/

    window.ajax = function (params, response) {

        //params Object
        //dom element
        //collback function

        window.preloader.load()

        let xhr = new XMLHttpRequest();
        xhr.open((params.type ? params.type : 'POST'), params.url)

        if (params.responseType == 'json') {
            xhr.responseType = 'json';
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.send(JSON.stringify(params.data))
        } else {

            let formData = new FormData()

            for (key in params.data) {
                formData.append(key, params.data[key])
            }

            xhr.send(formData)

        }

        xhr.onload = function () {

            response ? response(xhr.status, xhr.response) : ''

            window.preloader.stop()

            setTimeout(function () {
                if (params.btn) {
                    params.btn.classList.remove('btn-loading')
                }
            }, 300)
        };

        xhr.onerror = function () {
            window.STATUS.err('Error: ajax request failed')
        };

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 3) {
                if (params.btn) {
                    params.btn.classList.add('btn-loading')
                }
            }

        };
    }


    /* =================================================
    scroll
    ================================================= */

    window.scrollToTargetAdjusted = function (elem) {

        //elem string selector

        if (!document.querySelector(elem)) return false;

        let element = document.querySelector(elem);
        let headerOffset = 0;
        let elementPosition = element.offsetTop
        let offsetPosition = elementPosition - headerOffset;

        var offset = element.getBoundingClientRect();

        window.scrollTo({
            top: offset.top,
            behavior: "smooth"
        });
    }

    /* ==================================================
    maska
    ==================================================*/
    const {
        MaskInput,
    } = Maska

    function initMaska() {
        //new MaskInput("[data-maska]")
    }

    initMaska();


    /* ==============================================
     select
    ============================================== */

    // public methods
    // select.afSelect.open()
    // select.afSelect.close()
    // select.afSelect.update()

    const selectCustom = new afSelect({
        selector: 'select'
    })

    selectCustom.init()

    /* ==========================================
       suggest input
     ========================================== */

    class inputSuggest {

        constructor(option) {
            this.option = option
            this.elem = option.elem
            this.maxHeightSuggestList = this.option.maxHeightSuggestList || false
            this.list = document.createElement('ul');
            this.init()
        }

        init() {
            this.createSuggestList()
            this.addEvent()

            if (this.maxHeightSuggestList) {
                this.list.style.maxHeight = this.maxHeightSuggestList
            }
        }

        createSuggestList() {


            if (this.elem.dataset.url) {
                this.loadSuggestElem(this.elem.dataset.url, (arr) => {
                    this.renderSuggestList(arr)
                })
            } else {
                if (this.option.on.listHadler) {
                    this.option.on.listHadler(this)
                } else {
                    this.renderSuggestList([{
                        text: 'no result',
                        value: '0',
                    }])
                }
            }




        }

        renderSuggestList(arr) {

            this.list.querySelectorAll('li').forEach((removeItem) => {
                removeItem.remove()
            })

            arr.forEach((item) => {
                let li = document.createElement('li')
                li.innerText = item.text
                li.setAttribute('rel', item.value)

                this.eventListItem(li)
                this.list.append(li)
            })

            this.list.classList.add('suggest-list')
            this.mountList()
        }

        mountList() {

            if (this.elem.parentNode.querySelector('.suggest-list')) {
                this.elem.parentNode.querySelector('.suggest-list').remove()
            }

            this.elem.parentNode.append(this.list)

        }

        loadSuggestElem(url, callback) {
            window.ajax({
                type: 'GET',
                responseType: 'json',
                url: url
            }, function (status, response) {
                callback(response)
            })
        }

        changeInput(event) {

            let value = event.target.value.toLowerCase()

            if (this.elem.dataset.url) {

                this.list.style.display = 'initial'

                this.list.querySelectorAll('li').forEach(function (li) {

                    if (li.classList.contains('hide')) {
                        li.classList.remove('hide')
                    }

                    if (li.innerText.toLowerCase().indexOf(value) == -1 && value.length) {
                        li.classList.add('hide')
                    }
                })

                //update list
                this.mountList()
            } else {
                this.option.on.listHadler(this)
            }
        }

        closeList() {
            this.list.style.display = 'none'

            if (!this.elem.value.length) {
                this.elem.removeAttribute('area-valid')
                if (this.option.on.change) {
                    this.option.on.change('', false)
                }
            }

        }
        openList() {
            this.list.style.display = 'block'
            this.elem.setAttribute('area-valid', true)
            this.createSuggestList()
        }

        debounce(func, wait, immediate) {
            var timeout;

            return function () {

                var context = this,
                    args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) {
                        console.log('immediate::');
                        func.apply(context, args);
                    }
                }

                var callNow = immediate && !timeout;
                clearTimeout(timeout);

                timeout = setTimeout(later, wait);
                if (callNow) {
                    func.apply(context, args);
                }
            }
        }

        addEvent() {

            const debounceKeyup = this.debounce((e) => {
                this.changeInput(e)
            }, 300)

            this.elem.addEventListener('keyup', debounceKeyup)

            this.elem.addEventListener('focus', (event) => {
                this.openList()
            })

            this.elem.addEventListener('click', (event) => {
                event.stopPropagation()
            })

            this.elem.addEventListener('blur', () => {
                setTimeout(() => {
                    this.closeList()
                }, 100)
            })
        }

        eventListItem(li) {
            li.addEventListener('click', (event) => {
                this.elem.setAttribute('area-valid', true)
                this.elem.value = event.target.innerText
                this.closeList()

                if (this.option.on.change) {
                    this.option.on.change(event.target.innerText, event.target.getAttribute('rel'))
                }
            })
        }

    }

    /* ==================================================
   maska phone auth
   ==================================================*/

    if (document.querySelector('[data-phone-mask="auth"]')) {

        class AuthSendPhone {
            constructor() {
                this.input = document.querySelector('[data-phone-mask="auth"]')
                this.form = this.input.closest('form')
                this.buttonSubmit = this.form.querySelector('[type="submit"]')

                this.password = this.form.querySelector('[data-password="auth"]')
                this.maskCompleted = false

                this.initMask()
                this.addEvents()

            }

            initMask() {
                new MaskInput(this.input, {
                    mask: '+#(###) ###-##-##',
                    onMaska: (event) => {

                        this.input.setAttribute('aria-valid', event.completed ? 'true' : 'false')
                        this.maskCompleted = event.completed
                        this.validate()
                    }
                })

            }

            validate() {

                if (this.maskCompleted && this.password.value.length >= 6) {
                    this.buttonSubmit.removeAttribute('disabled')
                } else {
                    this.buttonSubmit.setAttribute('disabled', '')
                }

            }

            addEvents() {
                this.password.addEventListener('keyup', e => {
                    this.validate()
                })
            }


        }

        new AuthSendPhone();

    }


    /* ==================================================
    maska phone registration
    ==================================================*/

    if (document.querySelector('[data-phone-mask="registration"]')) {

        class RegistrationSendPhone {
            constructor() {
                this.input = document.querySelector('[data-phone-mask="registration"]')
                this.form = this.input.closest('form')
                this.buttonSubmit = this.input.closest('form').querySelector('[type="submit"]')

                this.initMask()
                this.addEvents()
            }

            initMask() {
                new MaskInput(this.input, {
                    mask: '+#(###) ###-##-##',
                    onMaska: (event) => {

                        if (!event.completed) {
                            this.input.setAttribute('aria-valid', 'false')
                            this.buttonSubmit.setAttribute('disabled', '')
                        }

                        if (event.completed) {
                            this.input.setAttribute('aria-valid', 'true')
                            this.buttonSubmit.removeAttribute('disabled')
                        }

                    }
                })
            }

            addEvents() {
                this.form.addEventListener('submit', e => {

                    const policy = this.form.querySelector('[name="policy"]')

                    if (!policy.checked) {
                        e.preventDefault()
                        window.STATUS.err('Необходимо принять условия правил пользования сервисом ')
                    }

                })
            }
        }

        new RegistrationSendPhone();

    }

    /* ==================================================
    maska phone registration
    ==================================================*/

    if (document.querySelector('[data-code-mask="registration"]')) {

        class RegistrationSendCode {
            constructor() {
                this.input = document.querySelector('[data-code-mask="registration"]')
                this.form = this.input.closest('form')
                this.elTimer = this.form.querySelector('[data-timer]')
                this.buttonSubmit = this.input.closest('form').querySelector('[type="submit"]')
                this.timerCount = 119

                this.initMask()
                this.startTimer(this.timerCount, this.elTimer)
            }

            initMask() {
                new MaskInput(this.input, {
                    mask: '####',
                    onMaska: (event) => {

                        if (!event.completed) {
                            this.input.setAttribute('aria-valid', 'false')
                            this.buttonSubmit.setAttribute('disabled', '')
                        }

                        if (event.completed) {
                            this.input.setAttribute('aria-valid', 'true')
                            this.buttonSubmit.removeAttribute('disabled')
                        }

                    }
                })
            }

            repeatSendCode(button) {

                button.textContent = 'Отправить код'
                button.removeAttribute('disabled')

                button.addEventListener('click', e => {

                    e.preventDefault()

                    // ajax request

                    button.setAttribute('disabled', 'disabled')
                    button.innerHTML = 'Выслать код заново (через <span data-timer>00:00</span> сек)'
                    this.startTimer(this.timerCount, button.querySelector('span'))
                })

            }

            startTimer(duration, display) {
                let timer = duration,
                    minutes, seconds;
                let instanceTimer = setInterval(() => {

                    minutes = parseInt(timer / 60, 10);
                    seconds = parseInt(timer % 60, 10);

                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;

                    display.textContent = minutes + ":" + seconds;

                    if (--timer < 0) {
                        clearInterval(instanceTimer)
                        this.repeatSendCode(display.closest('button'))
                    }
                }, 1000);
            }
        }

        new RegistrationSendCode();

    }

    /* ==========================================
    validate password
    ==========================================*/

    if (document.querySelector('[data-password="registration"]')) {

        class PasswordValidate {
            constructor(params) {
                this.inputPassword = params.input
                this.inputPasswordRepeat = params.inputRepeat
                this.inputPasswordRepeat = params.inputRepeat
                this.elRules = params.elRules
                this.addEvents()

                this.rules = {
                    enMum: null,
                    oneNum: null,
                    oneCaps: null,
                    passwordsMatch: null,
                }
            }

            validatePasswordEnNum(value) {
                let regexp = '(?=^.{8,}$)((?=.*\d)|(?=.*[A-Za-z])).*';
                return (value.match(regexp) ? true : false);
            }

            validatePasswordRus(value) {
                let regexp = '(?=.*[А-яЁё])';
                return (value.match(regexp) ? true : false);
            }

            validatePasswordOneNum(value) {
                let regexp = '(?=.*[0-9])';
                return (value.match(regexp) ? true : false);
            }

            validatePasswordCaps(value) {
                // debugger
                let regexp = '(?=.*[A-Z])';
                return (value.match(regexp) ? true : false);
            }

            validatePasswordMatch(value) {
                return (this.inputPassword.value === this.inputPasswordRepeat.value ? true : false);
            }

            validate(e) {

                const value = e.target.value

                this.rules = {
                    enMum: this.validatePasswordEnNum(value),
                    oneNum: this.validatePasswordOneNum(value),
                    oneCaps: this.validatePasswordCaps(value),
                    passwordsMatch: this.validatePasswordMatch(value),
                }

                this.elRules.forEach(item => {
                    item.setAttribute('class', this.rules[item.dataset.rule] ? 'is--valid' : 'is--invalid')
                });

                this.disableSubmitButton()
            }

            disableSubmitButton() {

                let errlog = []

                for (let key in this.rules) {
                    this.rules[key] || errlog.push(key)
                }

                if (errlog.length) {
                    this.inputPassword.closest('form').querySelector('[type="submit"]').setAttribute('disabled', '')
                } else {
                    this.inputPassword.closest('form').querySelector('[type="submit"]').removeAttribute('disabled')
                }

            }


            addEvents() {
                this.inputPassword.addEventListener('keyup', (e) => {
                    this.validate(e)
                })
                this.inputPasswordRepeat.addEventListener('keyup', (e) => {
                    this.validate(e)
                })
            }
        }


        new PasswordValidate({
            input: document.querySelector('[data-password="registration"]'),
            inputRepeat: document.querySelector('[data-password-repeat="registration"]'),
            elRules: document.querySelectorAll('[data-rules="password"] li')
        })

    }

    /* =====================================
    show hide pass
    =====================================*/

    if (document.querySelector('.show-pass')) {
        const items = document.querySelectorAll('.show-pass')

        items.forEach(item => {
            item.addEventListener('click', e => {
                if (item.classList.contains('is-active')) {
                    item.classList.remove('is-active')
                    item.closest('div').querySelector('input').setAttribute('type', 'password')
                } else {
                    item.classList.add('is-active')
                    item.closest('div').querySelector('input').setAttribute('type', 'text')
                }
            })
        })
    }

    /* =======================================
     click sort dropdown
     =======================================*/

    if (document.querySelector('.link-dropdown')) {
        const items = document.querySelectorAll('.link-dropdown')

        items.forEach(item => {
            item.addEventListener('click', e => {
                item.classList.toggle('is-active')

                document.addEventListener('click', e => {
                    if (item.classList.contains('is-active') && !e.target.closest('.link-dropdown')) item.classList.toggle('is-active')
                })

            })


        })
    }

    /* ======================================
    add parking
    ======================================*/

    if (document.querySelector('[data-parking="add"]')) {
        const items = document.querySelectorAll('[data-parking="add"]')

        function repeatSelect(value) {
            const selectThis = value.parentNode.cloneNode(true)
            selectThis.classList.remove('select-hidden')
            selectThis.classList.add('select-repeat')
            value.closest('.form__subitem').append(selectThis)

            const selectR = new afSelect({
                selector: '.select-repeat',
            })

            selectR.init()
        }

        items.forEach(item => {
            item.addEventListener('click', e => {

                const addParkingPopup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-parking-add.html'
                }, (status, response) => {


                    addParkingPopup.open(response, (instance) => {
                        const selectCustom = new afSelect({
                            selector: 'select',
                            on: {
                                change: function (value) {

                                    // const selectThis = value.parentNode.cloneNode(true)
                                    // selectThis.classList.remove('select-hidden')
                                    // selectThis.classList.add('select-repeat')
                                    // value.closest('.form__subitem').append(selectThis)

                                    // const selectR = new afSelect({
                                    //     selector: '.select-repeat',
                                    // })

                                    // selectR.init()

                                }
                            }
                        })

                        selectCustom.init()

                        // init suggest

                        if (instance.querySelectorAll('.input--suggest')) {

                            window.loadApiYmaps((ymaps) => {

                                instance.querySelectorAll('.input--suggest input').forEach((input) => {

                                    new inputSuggest({
                                        elem: input,
                                        on: {
                                            listHadler: function (inst) {

                                                if (!inst.elem.value.length) {
                                                    return false
                                                }

                                                ymaps.ready(() => {
                                                    ymaps.suggest(inst.elem.value).then(
                                                        (items) => {
                                                            const suggestArray = items.map(elem => ({
                                                                text: elem.displayName,
                                                                value: elem.value,
                                                            }));
                                                            inst.renderSuggestList(suggestArray)
                                                        },

                                                        (error) => {
                                                            console.err('Error inputSuggest ' + error)
                                                        }

                                                    )

                                                })
                                            }
                                        }
                                    });

                                })

                            })
                        }
                    })
                })


            })
        })
    }

    /* ======================================
    select device
    ======================================*/

    class SelectAddressYmaps {
        constructor(params) {
            this.$el = params.el;
            this.startCoordinates = (params.startCoordinates ? params.startCoordinates.split(',') : [55.753994, 37.622093]);
            this.params = params
            this.popup = null;
            this.placemark = null;
            this.coordinates = null;
            this.myMap = null;
            this.inputSearch = null;
            this.addressLine = 'Нет адреса'
            this.list = document.createElement('ul')
        }

        getBalloonTemplate() {
            return `
            
                <div class="select-ymaps" >
                    <div class="select-ymaps__title" >Ближайший адрес:</div>
                    <div class="select-ymaps__adrss" >${this.addressLine}</div>
                    <div class="select-ymaps__btn" >
                        <button class="btn" >Подтвердить</button> 
                    </div>
                </div>

            `;
        }

        getTemplate() {
            return `
                <div class="select-address-on-map" >
                    <div class="form" >
                        <div class="form__item" >
                            <div class="form__subitem" >
                                <div class="form__label" >Адрес ближайшего к устройству строения (выбор из поиска)</div>
                                <div class="input--suggest input--suggest-address">
                                    <input type="text" data-suggest="input" placeholder="Найти адрес">
                                </div>
                            </div>
                        </div>
                        <div class="form__item" >
                            <div class="form__subitem" ><div class="map-select" id="map-select" ></div></div>
                        </div>
                    </div>
                </div>
            `
        }

        geoCode(str) {

            if (!str) return false

            ymaps.geocode(str).then(

                (res) => {
                    this.addressLine = str
                    this.coordinates = res.geoObjects.get(0).geometry.getCoordinates()
                    this.placemark.geometry.setCoordinates(this.coordinates);
                    this.myMap.setCenter(this.coordinates)
                    this.placemark.properties.set('balloonContent', this.getBalloonTemplate())
                    this.placemark.balloon.open()
                },

                (err) => {
                    console.error('error: SelectAddressYmaps')
                }
            );
        }

        geoCodeCoordinates(arr) {

            ymaps.geocode(arr).then(

                (res) => {
                    this.coordinates = arr
                    this.addressLine = res.geoObjects.get(0).getAddressLine()
                    this.inputSearch.value = this.addressLine
                    this.placemark.properties.set('balloonContent', this.getBalloonTemplate())
                    this.placemark.balloon.open()
                },

                (err) => {
                    console.error('error: geoCodeCoordinates')
                }
            );


        }

        mapInit() {
            window.loadApiYmaps((ymaps) => {
                ymaps.ready(() => {

                    this.myMap = new ymaps.Map(this.$el, {
                        center: this.startCoordinates,
                        zoom: 14,
                        controls: []
                    }, {
                        searchControlProvider: 'yandex#search',
                        suppressMapOpenBlock: true
                    });

                    this.placemark = new ymaps.Placemark(this.myMap.getCenter(), {
                        hintContent: 'Адресс устройства',
                        balloonContent: this.getBalloonTemplate(),

                    }, {
                        preset: 'islands#blueCircleDotIconWithCaption',
                        iconColor: '#253678',
                        draggable: true,
                        hideIconOnBalloonOpen: false
                    });

                    this.placemark.events.add('dragend', (e) => {
                        this.geoCodeCoordinates(e.get('target').geometry.getCoordinates())
                    })

                    this.placemark.events.add('dragstart', (e) => {
                        this.placemark.balloon.close()
                    })

                    this.placemark.events.add('balloonopen', (e) => {
                        this.myMap.container._parentElement.querySelector('.select-ymaps__btn .btn').addEventListener('click', e => {
                            if (this.params.on.change) {
                                this.params.on.change({
                                    address: this.addressLine,
                                    coordinates: this.coordinates
                                })

                                this.popup.close()
                            }
                        })
                    })

                    this.myMap.geoObjects.add(this.placemark)
                    this.myMap.events.add('click', e => e.get('target').balloon.close());
                })
            })
        }

        open() {
            this.popup = new afLightbox({
                mobileInBottom: true
            })

            this.popup.open(this.getTemplate(), (instance) => {
                this.mapInit()
                this.inputSearch = instance.querySelector('[data-suggest="input"]')
                this.addEventInput()
            })

        }

        closeList() {
            this.list.style.setProperty('display', 'none')
        }
        showList() {
            this.list.style.setProperty('display', 'block')
        }


        eventListItem(li) {
            li.addEventListener('click', (event) => {
                this.inputSearch.setAttribute('area-valid', true)
                this.inputSearch.value = event.target.innerText

                this.geoCode(event.target.innerText)
                this.closeList()
            })
        }

        renderSuggestList(arr) {

            this.list.querySelectorAll('li').forEach((removeItem) => {
                removeItem.remove()
            })

            arr.forEach((item) => {
                let li = document.createElement('li')
                li.innerText = item.text
                li.setAttribute('rel', item.value)
                this.eventListItem(li)
                this.list.append(li)
            })

            this.list.classList.add('suggest-list')
            this.mountList()
        }

        mountList() {

            if (this.inputSearch.parentNode.querySelector('.suggest-list')) {
                this.inputSearch.parentNode.querySelector('.suggest-list').remove()
            }

            this.inputSearch.parentNode.append(this.list)
            this.list.style.setProperty('display', 'block')

        }

        getSuggestFromYmaps(e) {
            ymaps.ready(() => {
                ymaps.suggest(e.target.value).then(
                    (items) => {

                        const suggestArray = items.map(elem => ({
                            text: elem.displayName,
                            value: elem.value,
                        }));
                        this.renderSuggestList(suggestArray)
                    },

                    (error) => {
                        console.err('Error getSuggestFromYmaps ' + error)
                    }

                )
            })
        }

        addEventInput() {

            this.inputSearch.addEventListener('keyup', e => {
                this.getSuggestFromYmaps(e)
                this.showList()
            })

        }
    }

    /* ======================================
    add device
    ======================================*/

    function initPopupDevice(response, addDevice) {
        addDevice.open(response, (instance) => {
            const selectCustom = new afSelect({
                selector: 'select'
            })

            selectCustom.init()

            // init suggest
            if (instance.querySelectorAll('.input--suggest')) {

                window.loadApiYmaps((ymaps) => {

                    instance.querySelectorAll('.input--suggest input').forEach((input) => {

                        new inputSuggest({
                            elem: input,
                            on: {
                                listHadler: function (inst) {

                                    if (!inst.elem.value.length) {
                                        return false
                                    }

                                    ymaps.ready(() => {
                                        ymaps.suggest(inst.elem.value).then(
                                            (items) => {
                                                const suggestArray = items.map(elem => ({
                                                    text: elem.displayName,
                                                    value: elem.value,
                                                }));
                                                inst.renderSuggestList(suggestArray)
                                            },

                                            (error) => {
                                                console.err('Error inputSuggest ' + error)
                                            }

                                        )

                                    })
                                }
                            }
                        });

                    })

                })
            }

            // tabs

            if (document.querySelector('[data-tab-radio]')) {
                const radio = document.querySelectorAll('[data-tab-radio]')
                const container = document.querySelector('[data-tab-container="type-device"]')

                radio.forEach(item => {
                    item.addEventListener('change', e => {
                        container.querySelectorAll('[data-tab-item]').forEach(tab => {
                            if (tab.dataset.tabItem == item.dataset.tabRadio) {
                                tab.classList.add('is-active')
                            } else {
                                tab.classList.contains('is-active') ? tab.classList.remove('is-active') : ''
                            }
                        })
                    })
                })
            }

            //select address on map

            if (document.querySelector('[data-address="select-map"]')) {
                const openMap = instance.querySelector('[data-address="select-map"]')
                const coordinatesInput = instance.querySelector('[data-address="coordinates"]')

                openMap.addEventListener('click', e => {
                    e.preventDefault()

                    const selectAddress = new SelectAddressYmaps({
                        el: 'map-select',
                        startCoordinates: coordinatesInput.value,
                        on: {
                            change: function (e) {
                                console.log(e)
                                coordinatesInput.value = e.coordinates.join(',')
                                coordinatesInput.parentNode.style.display = 'block'
                                openMap.innerText = 'Изменить геометку'
                                instance.querySelector('[data-suggest="input"]').value = e.address
                            }
                        }
                    })

                    selectAddress.open()
                })
            }

            //mask for MAC address

            if (instance.querySelector('[data-mac-mask]')) {
                new MaskInput(instance.querySelector('[data-mac-mask]'), {
                    mask: '**-**-**-**-**-**',
                })
            }

        })
    }

    if (document.querySelector('[data-device="add"]')) {
        const items = document.querySelectorAll('[data-device="add"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const addDevice = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-connect-device.html'
                }, (status, response) => {

                    initPopupDevice(response, addDevice)

                })


            })
        })
    }


    /* ======================================
    edit device
    ======================================*/

    if (document.querySelector('[data-device="edit"]')) {
        const items = document.querySelectorAll('[data-device="edit"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const addDevice = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-connect-device--edit.html'
                }, (status, response) => {

                    initPopupDevice(response, addDevice)

                })


            })
        })
    }

    /* ======================================
    add script
    ======================================*/

    function initPopupAccessScripts(response, addScript) {

        addScript.open(response, (instance) => {

            // mask on time
            instance.querySelectorAll("[data-input-mask='time']").forEach(inputTime => {
                new MaskInput(inputTime, {

                    mask: (value) => {
                        if (value[1] == ':' || value[1] == '-' || value[1] == '.') {
                            return '#:##'
                        }
                        return '##:##'
                    },

                    postProcess: (value) => {
                        let arr = [];
                        value.split(':').forEach((num, index) => {
                            if (index == 0) Number(num) > 23 ? arr.push(23) : arr.push(num)
                            if (index == 1) Number(num) > 59 ? arr.push(59) : arr.push(num)
                        })
                        return arr.join(':')
                    }

                })
            })

            // toggle worktime

            if (document.querySelector('[data-toggle="worktime"]')) {
                const elToggle = document.querySelector('[data-toggle="worktime"]')
                const containerToggle = document.querySelector('[data-toggle-container="worktime"]')

                elToggle.addEventListener('click', e => {
                    containerToggle.classList.toggle('hidden')
                    elToggle.classList.toggle('is-active')
                    elToggle.innerText = containerToggle.classList.contains('hidden') ? 'Изменить' : 'Вернуть по умолчанию'
                })
            }


        })


    }

    if (document.querySelector('[data-script="add"]')) {
        const items = document.querySelectorAll('[data-script="add"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const addScript = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-script--create.html'
                }, (status, response) => {

                    initPopupAccessScripts(response, addScript)

                })


            })
        })
    }

    /* ======================================
    add group
    ======================================*/

    function initPopupAccessGroup(response, popup) {

        popup.open(response, (instance) => {

        })


    }

    if (document.querySelector('[data-group="add"]')) {
        const items = document.querySelectorAll('[data-group="add"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const popup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-group--create.html'
                }, (status, response) => {

                    initPopupAccessGroup(response, popup)

                })


            })
        })
    }


    /* ======================================
    add rights access
    ======================================*/

    function initPopupAccessRights(response, popup) {

        popup.open(response, (instance) => {

            //init select 
            const selectCustom = new afSelect({
                selector: 'select'
            })

            selectCustom.init()

            // tabs

            if (document.querySelector('[data-tab-radio]')) {
                const radio = document.querySelectorAll('[data-tab-radio]')
                const container = document.querySelector('[data-tab-container="type-user"]')

                radio.forEach(item => {
                    item.addEventListener('change', e => {
                        container.querySelectorAll('[data-tab-item]').forEach(tab => {
                            if (tab.dataset.tabItem == item.dataset.tabRadio) {
                                tab.classList.add('is-active')
                            } else {
                                tab.classList.contains('is-active') ? tab.classList.remove('is-active') : ''
                            }
                        })
                    })
                })
            }

        })


    }

    if (document.querySelector('[data-rights="add"]')) {
        const items = document.querySelectorAll('[data-rights="add"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const popup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-rights--create.html'
                }, (status, response) => {

                    initPopupAccessRights(response, popup)

                })


            })
        })
    }

    if (document.querySelector('[data-rights="edit"]')) {
        const items = document.querySelectorAll('[data-rights="edit"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const popup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-rights--edit.html'
                }, (status, response) => {

                    initPopupAccessRights(response, popup)

                })


            })
        })
    }

    /* ======================================
    add user list
    ======================================*/

    function initPopupAccessUsersList(response, popup) {

        popup.open(response, (instance) => {

            //init select 
            const selectCustom = new afSelect({
                selector: 'select'
            })

            selectCustom.init()

            // tabs

            if (document.querySelector('[data-tab-radio]')) {
                const radio = document.querySelectorAll('[data-tab-radio]')
                const container = document.querySelector('[data-tab-container="type-user"]')

                radio.forEach(item => {
                    item.addEventListener('change', e => {
                        container.querySelectorAll('[data-tab-item]').forEach(tab => {
                            if (tab.dataset.tabItem == item.dataset.tabRadio) {
                                tab.classList.add('is-active')
                            } else {
                                tab.classList.contains('is-active') ? tab.classList.remove('is-active') : ''
                            }
                        })
                    })
                })
            }

        })


    }

    if (document.querySelector('[data-users="add"]')) {
        const items = document.querySelectorAll('[data-users="add"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const popup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-users--create.html'
                }, (status, response) => {

                    initPopupAccessUsersList(response, popup)

                })


            })
        })
    }

    if (document.querySelector('[data-users="edit"]')) {
        const items = document.querySelectorAll('[data-users="edit"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const popup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-users--edit.html'
                }, (status, response) => {

                    initPopupAccessUsersList(response, popup)

                })


            })
        })
    }

    /* =================================
    change role
    ================================= */

    if (document.querySelector('.dropdown-icon__list')) {

        const listItem = document.querySelectorAll('.dropdown-icon__list li')

        listItem.forEach(item => {
            item.addEventListener('click', e => {
                listItem.forEach(li => li.classList.contains('is-active') ? li.classList.remove('is-active') : '')
                item.classList.add('is-active')
            })
        })
    }

    /* ================================
    scroll to active
    ================================ */

    function scrollToElem(elem, container) {
        var rect = elem.getBoundingClientRect();
        var rectContainer = container.getBoundingClientRect();

        let elemOffset = {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        }

        let containerOffset = {
            top: rectContainer.top + document.body.scrollTop,
            left: rectContainer.left + document.body.scrollLeft
        }

        let leftPX = elemOffset.left - containerOffset.left + container.scrollLeft - (container.offsetWidth / 2) + ((elem.offsetWidth + 0) / 2)



        container.scrollTo({
            left: leftPX,
            behavior: 'smooth'
        });
    }

    if (document.querySelector('[data-tab-center]')) {
        let container = document.querySelector('[data-tab-center]')
        let elem = container.querySelector('.is-active')

        setTimeout(() => {
            scrollToElem(elem, container)
        }, 100)
    }

    /* ==================================
    data-popup="live-photo"
    ================================== */

    function popupLivePhoto() {
        const popupLivePhoto = new afLightbox({
            mobileInBottom: true
        })

        window.ajax({
            type: 'GET',
            url: '/parts/_popup-live-photo.html'
        }, (status, response) => {

            popupLivePhoto.open(response, (instance) => {

                //init slider
                const splide = new Splide('[data-slider="live-photo"]', {
                    arrows: false,
                    pagination: false
                });

                function splideCounter(newIndex) {
                    const currentSlide = document.querySelector('[data-slider-counter="current"]')
                    const allSlides = document.querySelector('[data-slider-counter="all"]')
                    currentSlide.innerText = (newIndex + 1)
                    allSlides.innerText = splide.root.querySelectorAll('.splide__slide').length
                }

                splide.on('move', function (newIndex) {
                    splideCounter(newIndex)
                });
                splide.on('mounted', function (newIndex) {
                    splideCounter(0)
                });

                splide.mount();

                const prev = document.querySelector('[data-slider-prev="live-photo"]')
                const next = document.querySelector('[data-slider-next="live-photo"]')

                prev.addEventListener('click', e => splide.go('<'))
                next.addEventListener('click', e => splide.go('>'))

                //event click

                if (instance.querySelector('[data-popup="live-video"]')) {
                    instance.querySelector('[data-popup="live-video"]').addEventListener('click', e => {
                        popupLiveVideo()
                        popupLivePhoto.close()
                    })
                }

            })
        })
    }

    if (document.querySelector('[data-popup="live-photo"]')) {
        const buttons = document.querySelectorAll('[data-popup="live-photo"]')
        buttons.forEach(button => {
            button.addEventListener('click', popupLivePhoto)
        })
    }

    /* ==================================
    data-popup="live-video"
    ================================== */

    function popupLiveVideo() {
        const popupLiveVideo = new afLightbox({
            mobileInBottom: true
        })

        window.ajax({
            type: 'GET',
            url: '/parts/_popup-live-video.html'
        }, (status, response) => {

            popupLiveVideo.open(response, (instance) => {

                if (instance.querySelector('[data-popup="live-photo"]')) {
                    instance.querySelector('[data-popup="live-photo"]').addEventListener('click', e => {
                        popupLivePhoto()
                        popupLiveVideo.close()
                    })
                }

            })
        })
    }

    if (document.querySelector('[data-popup="live-video"]')) {

        const buttons = document.querySelectorAll('[data-popup="live-video"]')
        buttons.forEach(button => {
            button.addEventListener('click', popupLiveVideo)
        })

    }

    /* ===================================
    datepicker
    ===================================*/

    if (document.querySelector('[data-input="datepicker"]')) {

        (function () {
            Datepicker.locales.ru = {
                days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
                daysShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб"],
                daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
                months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
                today: "Сегодня",
                clear: "Очистить",
                format: "dd.mm.yyyy",
                weekStart: 1,
                monthsTitle: 'Месяцы'
            }
        })();

        const elem = document.querySelector('.report-filter')

        const datepicker = new DateRangePicker(elem, {
            autohide: true,
            language: 'ru',
            inputs: [
                elem.querySelector('[data-datepicker="start"]'),
                elem.querySelector('[data-datepicker="end"]'),
            ]
        });
    }

    /* =============================
    report
    =============================*/

    if (document.querySelector('.report-type')) {
        document.querySelector('.report-type').addEventListener('change', e => {
            window.location.href = e.target.value
        })
    }

    /* ======================================
    Распределение доступа по времени суток
    ======================================*/

    if (document.querySelector('[data-popup="access-bytime"]')) {
        const items = document.querySelectorAll('[data-popup="access-bytime"]')

        items.forEach(item => {
            item.addEventListener('click', e => {
                const popup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-access-bytime.html'
                }, (status, response) => {

                    popup.open(response, (instance) => {

                        const livePhoto = instance.querySelectorAll('[data-popup="live-photo"]')
                        livePhoto.forEach(button => {
                            button.addEventListener('click', popupLivePhoto)
                        })

                        const liveVideo = instance.querySelectorAll('[data-popup="live-video"]')
                        liveVideo.forEach(button => {
                            button.addEventListener('click', popupLiveVideo)
                        })

                    })
                })
            })
        })
    }

    /* ===============================
    play video
    =============================== */

    if (document.querySelector('[data-popup="video"]')) {
        document.querySelectorAll('[data-popup="video"]').forEach(item => {
            item.addEventListener('click', e => {
                popupLiveVideo()
            })
        })
    }
    if (document.querySelector('[data-popup="photo"]')) {
        document.querySelectorAll('[data-popup="photo"]').forEach(item => {
            item.addEventListener('click', e => {
                popupLivePhoto()
            })
        })
    }




}); //domContentLoaded