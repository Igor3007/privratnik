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
                    <div class="af-dialog-revert__msg" >Вы удалили парковку «Парковка 2».</div>
                    <div class="af-dialog-revert__btn" >Отменить</div>
                    <div class="af-dialog-revert__close" >+</div>
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
                hideMSG(elementStatus)
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
            let instanseTimer = setInterval(() => {

                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                //seconds = seconds < 10 ? "0" + seconds : seconds;

                display.textContent = '(' + (minutes == '00' ? '' : minutes + ":") + seconds + ' сек)';

                if (--timer < 0) {
                    clearInterval(instanseTimer)
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

                this.startTimer(5, buttonApply.querySelector('span'))

                buttonApply.addEventListener('click', e => {
                    this.hideElement(params.removeHtmlElem)
                    this.topStatusRevert(params)
                    popupDialog.close()
                })

            })

        }

    }

    window.dialog = new Dialog()

    document.querySelectorAll('.row-remove').forEach(item => {
        item.addEventListener('click', e => {
            window.dialog.remove({
                removeHtmlElem: item.closest('.table__tr'),
                title: 'Удаление парковки',
                desc: 'Внимание! Вы уверены, что хотите удалить парковку «Парковка 2» со всеми добавленными к ней данными и доступами?',
                onConfirm: function () {
                    console.log('удалено')
                }
            })
        })
    })


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
        //new MaskInput("[data-maska]")
    }

    initMaska();

    const {
        MaskInput,
    } = Maska



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

        items.forEach(item => {
            item.addEventListener('click', e => {

                const addParkingPopup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-parking-add.html'
                }, (status, response) => {


                    addParkingPopup.open(response, (instanse) => {
                        const selectCustom = new afSelect({
                            selector: 'select'
                        })

                        selectCustom.init()

                        // init suggest

                        if (instanse.querySelectorAll('.input--suggest')) {

                            window.loadApiYmaps((ymaps) => {

                                instanse.querySelectorAll('.input--suggest input').forEach((input) => {

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
            this.popup = null;
            this.placemark = null;
            this.myMap = null;
            this.inputSearch = null;
            this.list = document.createElement('ul')
        }

        getBalloonTemplate() {
            return `
            
                <div class="select-ymaps" >
                    <div class="select-ymaps__title" >Ближайший адрес:</div>
                    <div class="select-ymaps__adrss" >Москва, Островского улица, 36</div>
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
                    let coordinates = res.geoObjects.get(0).geometry.getCoordinates()
                    this.placemark.geometry.setCoordinates(coordinates);
                    this.myMap.setCenter(coordinates)
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
                    this.inputSearch.value = res.geoObjects.get(0).getAddressLine()
                },

                (err) => {
                    console.error('error: geoCodeCoordinates')
                }
            );
        }

        mapInit() {
            window.loadApiYmaps((ymaps) => {
                ymaps.ready(() => {

                    this.myMap = new ymaps.Map('map-select', {
                        center: [55.753994, 37.622093],
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

                    this.myMap.geoObjects.add(this.placemark)
                })
            })
        }

        open() {
            this.popup = new afLightbox({
                mobileInBottom: true
            })

            this.popup.open(this.getTemplate(), (instanse) => {
                this.mapInit()
                this.inputSearch = instanse.querySelector('[data-suggest="input"]')
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

                        console.log(items)

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
    select device
    ======================================*/


    if (document.querySelector('[data-device="add"]')) {
        const items = document.querySelectorAll('[data-device="add"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                const addParkingPopup = new afLightbox({
                    mobileInBottom: true
                })

                window.ajax({
                    type: 'GET',
                    url: '/parts/_popup-connect-device.html'
                }, (status, response) => {


                    addParkingPopup.open(response, (instanse) => {
                        const selectCustom = new afSelect({
                            selector: 'select'
                        })

                        selectCustom.init()

                        // init suggest
                        if (instanse.querySelectorAll('.input--suggest')) {

                            window.loadApiYmaps((ymaps) => {

                                instanse.querySelectorAll('.input--suggest input').forEach((input) => {

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
                            const openMap = document.querySelector('[data-address="select-map"]')

                            openMap.addEventListener('click', e => {
                                e.preventDefault()

                                const selectAddress = new SelectAddressYmaps({
                                    el: '.errr'
                                })

                                selectAddress.open()

                            })
                        }
                    })
                })


            })
        })
    }






});