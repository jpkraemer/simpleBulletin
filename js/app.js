// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

$(document).ready(function($) {
	$(".post a").on("click", function () {
		var $editModal = $("#editModal"); 
		$editModal.find(":input[name='newPost[id]']").val($(this).parents(".post").data("id")); 
		$editModal.find(":input[name='newPost[content]']").text($(this).parents(".post").find(".row:eq(2) p").text()); 
		$editModal.find(".columns:first p").text($(this).parents(".post").find(".row:first h3").text()); 
	});
});