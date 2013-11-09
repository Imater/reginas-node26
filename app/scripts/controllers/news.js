//#fpk/news

myApp.controller('newsCtrl', function ($scope, $resource, $rootScope, $location, socket, $routeParams,  myApi, $routeSegment, $timeout, $http) {

  $scope.fpk.leftmenu = { active:8,
                items : [
                  {id:10, title:"Добавить новость", href: "/fpk/settings/models", segment: "s1.settings.models"},
                  {id:11, title:"Тестовые автомобили", href: "/fpk/settings/tests", segment: "s1.settings.tests"},
                  {id:12, title:"Юр.лица Холдинга", href: "/fpk/settings/organizations", segment: "s1.settings.organizations"}
                ]

                };
                

});