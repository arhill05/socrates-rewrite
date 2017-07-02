var app = angular.module('app');

app.controller('sessionCtrl', [
    'Auth',
    '$scope',
    '$state',
    '$firebaseObject',
    '$firebaseArray',
    function (Auth, $scope, $state, $firebaseObject, $firebaseArray) {
        var self = this;
        self.sessionPin = $state.params.sessionPin;
        $scope.session = null;
        $scope.questions = [];
        $scope.auth = null;
        $scope.user = null;
        $scope.showLoading = true;
        $scope.userIsAdmin = false;
        $scope.newQuestion = {
            questionText: null,
            upvotes: 0
        };

        self.onInit = function () {
            let sessionRef = firebase
                .database()
                .ref()
                .child("sessions/" + self.sessionPin);
            let sessionObj = $firebaseObject(sessionRef);
            sessionObj
                .$loaded()
                .then(function () {
                    $scope.session = sessionObj;
                    let questionsRef = firebase
                        .database()
                        .ref()
                        .child('sessions_questions')
                        .child(sessionObj.$id);
                    $scope.questions = $firebaseArray(questionsRef);
                    $scope
                        .questions
                        .$loaded()
                        .then($scope.showLoading = false);
                });

            Auth.$onAuthStateChanged(function (firebaseUser) {
                $scope.auth = firebaseUser;
                let usersRef = firebase
                    .database()
                    .ref()
                    .child("users/" + $scope.auth.uid);
                let userObj = $firebaseObject(usersRef);
                userObj
                    .$bindTo($scope, "user")
                    .then(function () {
                        console.log($scope.user);
                    });
            });
        }

        self.upvoteQuestion = function (question) {
            if (!$scope.user.upvotedQuestionIds) {
                question.upvotes += 1;
                $scope
                    .questions
                    .$save(question);
                $scope.user.upvotedQuestionIds = [question.$id];
            } else {
                let questionIndex = $scope
                    .user
                    .upvotedQuestionIds
                    .indexOf(question.$id);
                if (questionIndex == -1) {
                    question.upvotes += 1;
                    $scope
                        .questions
                        .$save(question);
                    $scope
                        .user
                        .upvotedQuestionIds
                        .push(question.$id);
                } else {
                    question.upvotes -= 1;
                    $scope
                        .questions
                        .$save(question);
                    $scope
                        .user
                        .upvotedQuestionIds
                        .splice(questionIndex, 1);
                }
            }
        };

        self.addQuestion = function () {
            if ($scope.newQuestion.questionText !== null) {
                $scope
                    .questions
                    .$add($scope.newQuestion);
                $scope.newQuestion.questionText = null;
            } else {
                toastr.error('Please enter a question!');
            }
        };

        self.removeQuestion = (question) => {
            $scope
                .questions
                .$remove(question);
        }

        self.userIsAdmin = () => {
            if ($scope.session && $scope.user && $scope.user.$id == $scope.session.sessionOwnerUID) {
                return true;
            } else 
                return false;
            }
        
        self.onHomeClick = () => {
            $state.go('start');
        }

        self.onLoginClick = () => {
            $state.go('login');
        }

        self.onAccountClick = () => {
            $state.go('account');
        }

        self.userHasUpvoted = (question) => {
            return ($scope.user.upvotedQuestionIds && $scope.user.upvotedQuestionIds.indexOf(question.$id) > -1)
        }

        self.onInit();
    }
]);