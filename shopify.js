'use strict';

var Shopify = angular.module('Shopify', ['ngRoute']);

Shopify.config(['$routeProvider',
    function($routeProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'form.html',
				controller: 'ShC'
			}).
			otherwise({
				redirectTo: '/'
			});
}]);

Shopify.controller('ShC',
	function($scope, $http, $q) {
		$scope.Save = function() {
			var data = {};
		    $('#theForm input, #theForm textarea').each(function (k, v) {
		    	var key = $(v).attr('id');
		    	var value = $('#'+key).val();
		    	data[key] = value;
		    });
		    $scope.dataToSubmit = {
		    	'sys': {
		    		'l': $scope.apilog,
		    		'p': $scope.apipass,
		    		'u': $scope.apiurl
		    	},
		    	'product': {
		    		'title': data.title,
		    		'body_html': data.body_html,
		    		'vendor': data.vendor,
		    		'product_type': data.product_type,
		    		'published': data.published ? 'true' : 'false',
		    		'variants':
		    			[{
		    				 'option1': ' - ',
		    				 'price': data.price,
		    				 'sku': data.sku
		    			 }]
		    	}	
		    };
		    if(!$scope.uploadme.src.length) {
		    	alert('You forgot the picture');
		    	return false;
		    }
			console.log($scope.dataToSubmit);
			$scope.dataScreen = $scope.dataToSubmit.product;
			
			$scope.dataToSubmit.product.images = [{'attachment':$scope.uploadme.src.split(',')[1]}];
			if(typeof url != 'undefined') {
				$http.post(url+'?t='+(new Date()).getTime(), $scope.dataToSubmit)
					.then(function(data){
						console.log(data);
						if(typeof data.data.product_id != 'undefined') {
							$scope.dataScreen = 'Request to Shopify was successful. New product ID is ' + data.data.product_id;
							$scope.dataScreenClass = 'success';
						}
						else {
							$scope.dataScreen = 'Request to Shopify was unsuccessful. Error message: ' + data.data.errors;
							$scope.dataScreenClass = 'error';
						}
					});
			}
		}
		$scope.formUrl = '';
		$scope.dataToSubmit = '';
		$scope.apilog = $scope.apipass = $scope.apiurl = '';
		$scope.useShopify = 1;
		$scope.image = null;
		$scope.imageFileName = '';
		$scope.uploadme = {};
		$scope.uploadme.src = '';
	}
)
.directive('fileDropzone', function() {
	return {
		restrict: 'A',
		scope: {
			file: '=',
			fileName: '='
		},
		link: function(scope, element, attrs) {
			var checkSize,
				isTypeValid,
				processDragOverOrEnter,
				validMimeTypes;
	      
			processDragOverOrEnter = function (event) {
				if (event != null) {
					event.preventDefault();
				}
				event.dataTransfer.effectAllowed = 'copy';
				return false;
			};
			validMimeTypes = attrs.fileDropzone;
			checkSize = function(size) {
				var _ref;
				if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
					return true;
				} else {
					alert("File must be smaller than " + attrs.maxFileSize + " MB");
					return false;
				}
			};
			isTypeValid = function(type) {
				if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
					return true;
				} else {
					alert("Invalid file type.  File must be one of following types " + validMimeTypes);
					return false;
				}
			};
	      
			element.bind('dragover', processDragOverOrEnter);
			element.bind('dragenter', processDragOverOrEnter);

			return element.bind('drop', function(event) {
				var file, name, reader, size, type;
				if (event != null) {
					event.preventDefault();
				}
				reader = new FileReader();
				reader.onload = function(evt) {
					if (checkSize(size) && isTypeValid(type)) {
						return scope.$apply(function() {
							scope.file = evt.target.result;
							if (angular.isString(scope.fileName)) {
								return scope.fileName = name;
							}
						});
					}
				};
				file = event.dataTransfer.files[0];
				name = file.name;
				type = file.type;
				size = file.size;
				reader.readAsDataURL(file);
				return false;
			});
		}
	};
})
.directive("fileread", [
	function () {
		return {
			scope: {
				fileread: "="
			},
			link: function (scope, element, attributes) {
				element.bind("change", function (changeEvent) {
					var reader = new FileReader();
					reader.onload = function (loadEvent) {
						scope.$apply(function () {
							scope.fileread = loadEvent.target.result;
						});
					}
					reader.readAsDataURL(changeEvent.target.files[0]);
				});
			}
		}
	}
]);
