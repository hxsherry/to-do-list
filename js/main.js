;(function () {
    'use strict';
    let sound = document.getElementById('sound');
    let Event = new Vue();
    Vue.component('task', {
        data: function () {
            return {}

        },
        template: '#taskTpl',
        props: ['todo', 'mode'],
        methods: {
            action(name, params) {
                Event.$emit(name, params)
            }
        }
    })

    new Vue({
        el: '#main',
        data: {
            lists: [],
            mode: 'add',
            current: {
                id: 0,
                title: '',
                completed: false,
                showDetail: false,
                desc: '',
                alertTime: ''
            }
        },
        mounted() {
            let that = this;
            this.lists = ms.get('list') || [];
            Event.$on('toggleComplete', function (params) {
                if (params) {
                    that.toggleComplete(params)
                }
            });
            Event.$on('remove', function (params) {
                if (params) {
                    that.remove(params)
                }
            });
            Event.$on('preUpdate', function (params) {
                if (params) {
                    that.preUpdate(params)
                }
            });
            Event.$on('toggleDetail', function (params) {
                if (params) {
                    that.toggleDetail(params)
                }
            });
            setInterval(function () {
                that.checkAlertTime()
            }, 1000)
        },
        methods: {
            copy(obj) {
                return Object.assign({}, obj)
            },
            resetCurrent() {
                //这里current是一个对象了！！
                this.current = {}
            },
            getMaxId() {
                let maxId = 0;
                this.lists.forEach(function (item, index) {
                    maxId = item.id > maxId ? item.id : maxId
                })
                return maxId;
            },
            validate() {
                let title = this.current.title;
                if (!title || title.trim() === '') {
                    swal('Please enter a title!')
                    return false;
                }
                return true;
            },
            add() {
                if (this.validate()) {
                    let copyList = this.copy(this.current);
                    copyList.id = this.getMaxId() + 1;
                    this.lists.push(copyList);
                    this.resetCurrent();
                }
            },
            preUpdate(todo) {
                this.current = this.copy(todo);
                this.mode = 'update';
            },
            update() {
                if (this.validate()) {
                    let that = this;
                    let i = this.findIndexById(that.current.id)
                    Object.assign(this.lists[i], this.copy(this.current))
                    this.resetCurrent();
                    this.mode = 'add'
                }
            },
            remove(id) {
                let index = this.findIndexById(id)
                this.lists.splice(index, 1);
            },
            //找index方法二:forEach()
            findIndexById(id) {
                return this.lists.findIndex(function (item) {
                    return item.id === id;
                })
            },
            toggleComplete(id) {
                let i = this.findIndexById(id);
                Vue.set(this.lists[i], 'completed', !this.lists[i].completed)
                // this.lists[i].completed = !this.lists[i].completed
            },
            checkAlertTime() {
                let that = this;
                this.lists.forEach(function (item, i) {
                    let alertTime = (new Date(item.alertTime)).getTime();
                    if (!alertTime || item.alertConfirmed) return;
                    let now = new Date().getTime();
                    if (alertTime <= now) {
                        sound.play();
                        let confirmed = window.confirm(item.title);
                        //重新设置了一条
                        Vue.set(that.lists[i], 'alertConfirmed', confirmed);

                    }
                })
            },
            toggleDetail(id) {
                let i = this.findIndexById(id)
                // this.lists[i].showDetail = !this.lists[i].showDetail
                Vue.set(this.lists[i], 'showDetail', !this.lists[i].showDetail)
            }


        },
        watch: {
            lists: {
                deep: true,
                handler: function (newValue, oldValue) {
                    if (newValue) {
                        ms.set('list', newValue)
                    } else {
                        ms.set('list', [])
                    }
                }
            }
        }
    })
})();
