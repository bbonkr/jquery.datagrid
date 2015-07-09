# jquery.datagrid

## Usage

```javascript
$('#datagrid').datagrid(option);
```

### option definition

|Name|Type|Required|Default Vaue|Remark|
|-
|url|String|Required||데이터 서비스 경로 text/json 데이터를 사용|
|columns|Array|Required||열 정의(column type)를 배열로 입력합니다.|
|tableId|String|||datagrid를 출력할 table 엘리먼트의 id; **제거해야 함**|
|paginationId|String|||페이징 영역을 출력할 영역의 id|
|useCustomHeader|Boolean||false|헤더영역을 사용자가 정의할지 여부|
|usePaging|Booleadn||false|페이징 영역을 출력할지 여부|
|page|Int32 ?||1|현재 페이지 번호|
|rows|Int32 ?||10|한 페이지에 출력할 행의 수|
|pageCount|Int32 ?||5|페이징 영역에 표시할 페이지 수|
|debug|Boolean||false|Debug console 에 디버그 메세지 출력 여부|
|afterDataBind|||Function|데이터 소스를 바인딩하고 datagrid 출력 후 실행할 함수|

### column definition

|Name|Type|Required|Default Value|Remark|
|-
|name|String|Required||json 데이터와 열을 연결할 이름|
|header|String|||헤더에 표시할 문자열|
|width|Object||auto|열의 넓이|
|class|String|||열에 적용할 css class|
|hidden|Boolean||true|열 출력 여부|
|sortable|Boolean||false|열의 정렬 지원 여부|
|formatter|Function|||열의 자료를 출력할 때, 적용할 포맷팅이 정의된 함수 function(object):String |


### Sample

``` javascript
<!doctype html>
<html>
	<head>
		<title>Sample : jquery.datagrid</title>
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
		<!-- Optional theme -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css">
		<!-- jquery -->
		<script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
		<!-- Latest compiled and minified JavaScript -->
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
		<!-- jquery.datagrid -->
		<script src="./Scripts/jquery.datagrid.js"></script>
	</head>
	<body>
		<div class="container">
			<div class="table-responsive">
				<table id="datagrid" class="table table-striped"></table>
				<nav id="datagridpagination"></nav>
			</div>
		</div>
	</body>

	<script type="text/javascript">
		$(document).ready(function(){
			var url = '/test/json';
			$('#datagrid').datagrid({
				'url' : url,
				'columns' : [
					{'name':'id', 'header' : 'ID', width:0},
					{'name':'name', 'header' : 'Name', width:0},
					{'name':'password', 'header' : 'Password', width:0}
				],
				'tableId': '#datagrid',
				'paginationId': '#datagridpagination',
				'useCustomHeader': false,
				'usePaging': true,
				'page': 1,
				'rows': 5,
				'pageCount': 5,
				'debug': true,
				'afterDataBind':function(){
					$('#datagrid > tbody > tr').off('click');
					$('#datagrid > tbody > tr').on('click', function(){
						var id = $(this).children('td').first().text();
						location.href = './users?id=' + id;
					});
				}
			});
		});
	</script>
</html>
```

### Server Requirements

Method : GET
Parameter :

|Name|Type|Required|Remark|
|-
|page|Int32 ?||현재 페이지 번호|
|rows|Int32 ?|Required|한 페이지에 출력할 행의 수|
|sidx|String||정렬 필드 이름|
|sord|String||정렬 방법 (ASC or DESC)|

Return Type : text/json

|Name|Type|Required|Remark|
|-
|Result|String|Required|성공은 빈값, 오류가 발생한 경우 error|
|Total|Int32|Required|<del>전체 페이지의 수</del> 페이징 되지 않은 전체 행의 수|
|Records|Int32||사용되지 않음|
|Rows|Array|Required|datagrid에 출력할 데이터|