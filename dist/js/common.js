document.addEventListener("DOMContentLoaded", function (event) {

    const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';


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


    /* ==============================================
    mobile menu
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
            _header = (_header ? _header : 'Успешно')
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

    function initMaska() {

    }

    initMaska();

    const {
        MaskInput,
    } = Maska

    new MaskInput("[data-maska]")

    /* ==================================================
   maska phone auth
   ==================================================*/

    if (document.querySelector('[data-phone-mask="auth"]')) {

        class AuthSendPhone {
            constructor() {
                this.input = document.querySelector('[data-phone-mask="auth"]')
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
                if (document.querySelector('[data-password="auth"]').value.length !== '') {
                    this.input.setAttribute('aria-valid', 'true')
                    this.buttonSubmit.removeAttribute('disabled')
                }
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
                let instanseTimer = setInterval(() => {

                    minutes = parseInt(timer / 60, 10);
                    seconds = parseInt(timer % 60, 10);

                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;

                    display.textContent = minutes + ":" + seconds;

                    if (--timer < 0) {

                        clearInterval(instanseTimer)
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


});