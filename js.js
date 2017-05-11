(function() {
    "use strict";
    var Drawer = function() {
        if (Drawer.instance) {
            return Drawer.instance;
        }
        Drawer.instance = this;
        
        this.ctx = $('canvas')[0].getContext('2d');
        $('canvas')[0].width = window.innerWidth;
        $('canvas')[0].height = window.innerHeight-50;
        this.brushSize = 3;
        this.activeColor = '#000';
        this.mouse = {
            x : 0,
            y : 0,
            down : false,
        }
        this.user = {
            isAnon : null,
            id : null,
        }
        this.config = {
            //firebase config
            apiKey: "",
            authDomain: "",
            databaseURL: "",
            storageBucket: "",
            messagingSenderId: ""
          };
        firebase.initializeApp(this.config);
        this.init();
    };
    window.Drawer = Drawer;
    Drawer.prototype = {
        init: function() {
            this.logIn();
            console.log("js.js initialized")
            this.bindListener();
        },
        bindListener: function(){
            var self = this;
            $('canvas').on('mousedown', function(e){
                self.mouse.down = true;
                self.draw(self.mouse.x,self.mouse.y);
            });
            $('canvas').on('mouseup', function(){
                self.mouse.down = false;
            })
            $('canvas').on('mousemove', function(e){
                self.mouse.x = e.clientX;
                self.mouse.y = e.clientY;
                if(self.mouse.down){
                    self.draw(self.mouse.x,self.mouse.y);
                }
            })
            $('.color').on('change', function(){
                self.activeColor = $(this).val();
            })
            $('.js-brush-size').on('change', function(){
                self.brushSize = parseInt($(this).val());
            })
        },
        draw: function(x,y){
            var self = this;
            
            firebase.database().ref('coords/').push({
                x : x,
                y : y,
                color : self.activeColor,
                brushSize : self.brushSize,
            })
        },
        logIn: function(){
            var self = this;
            firebase.auth().signInAnonymously().catch(function(error) {
                console.log(error.code, error.message);
                console.log("logged in");
            });
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    self.user.isAnon = user.isAnonymous;
                    self.user.id = user.uid;
                }
            });
            this.db = firebase.database();
            this.coordQuery = this.db.ref('coords/');
            this.coordQuery.once('value').then(function(coords) {
                coords.forEach(function(child){
                    self.drawNodes(child.val().x,child.val().y,child.val().color,child.val().brushSize);
                })
                console.log("ALL NODES DRAWN");
            });
            this.coordQuery.limitToLast(1).on('child_added', function(child){
                self.drawNodes(child.val().x,child.val().y,child.val().color,child.val().brushSize);
            })
            return;
        },
        drawNodes: function(x,y,color,brushSize){
            this.ctx.beginPath();
            this.ctx.fillStyle = color;
            this.ctx.arc(x,y,brushSize,0,Math.PI*2)
            this.ctx.fill();
        }
    }
    window.onload = function() {
        var app = new Drawer();
    };
})();
