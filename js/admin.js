var StoreAdmin = {};

StoreAdmin.start = function(){
	$(document).ready(function() {
		StoreAdmin.bindMenuBtns();
		StoreAdmin.loadCategories();
		StoreAdmin.loadProducts();
		StoreAdmin.bineForms();
		$("#welcome-page").fadeIn();
	});
};


StoreAdmin.bindMenuBtns = function(){
	var menuButtons = $(".menu-btn")
	menuButtons.each(function(){
		var btn = $(this);
		btn.click(function(e){
			e.stopPropagation();
			var clickedBtn = $(this);
			StoreAdmin.showAdminPage(clickedBtn.attr("id"));
			$(".menu-btn.selected").removeClass("selected");
			clickedBtn.addClass("selected");
		});
	});
};


StoreAdmin.loadCategories = function(){
	$.get("/categories",function(result){
		if (result["STATUS"] == "ERROR"){
			alert(result["MSG"]);
		}else{
			var categories = result["CATEGORIES"];
			if (categories.length == 0){
				$("body").addClass("no-categories");
			}else{
				$("body").removeClass("no-categories");
			}
			for (i in categories){
				StoreAdmin.renderCategory(categories[i].name, categories[i].id);
			}
		}
	},"json");
};

StoreAdmin.loadProducts = function(){
	$("#products-holder").empty();
	StoreAdmin.createNewProductBtn();
	StoreAdmin.clearProductForm();
	$.get("/products",function(result){
		if (result["STATUS"] == "ERROR"){
			alert(result["MSG"]);
		}else{
			var products = result["PRODUCTS"];
			for (i in products){
				StoreAdmin.renderProduct(products[i]);
			}
		}
	},"json");
};


StoreAdmin.renderCategory = function(catName, catId){
	var categoriesHolder = $("#categories-holder");
	var categoryBtn = $("<div />").addClass("cat-btn clickable").text(catName).attr("id",catId);
	var delCat = $("<i />").addClass("fa fa-trash-o delete-cat");
	delCat.click(function(e){
		e.stopPropagation();
		var clickedBtn = $(this);
		StoreAdmin.deleteCategory(clickedBtn);
	});
	categoryBtn.append(delCat);
	categoriesHolder.append(categoryBtn);

	//Update the categories dropdown in the product form
	var categorySelect = $("select#choose-cat");
	var catOp = $("<option />").attr("value",catId).text(catName);
	categorySelect.append(catOp);
};

StoreAdmin.renderProduct = function(product){
	var productsHolder = $("#products-holder");
	productBtn = $("<div />").addClass("product-btn clickable").css("background-image","url('" + product.img_url+ "')").attr("id",product.id);
	productTitle = $("<div />").addClass("p-title").text(product.title).prepend($("<i class='edit-product fa fa-pencil'></i>"));
	productBtn.append(productTitle);
	productBtn.click(function(e){
		e.stopPropagation();
		var clickedProduct = $(this);
		StoreAdmin.showAdminPage("loading");
		$.get("/product/" + clickedProduct.attr("id"),function(res){
			var addProductForm = $("form#add-product");
			addProductForm.find("input[type='text'], select, input[type='hidden']").each(function(){
				$(this).val(product[$(this).attr("name")]);
			});
			addProductForm.find("textarea[name='desc']").text(product["description"]);
			if (product["favorite"]){
				addProductForm.find("input[name='favorite']").prop('checked' , true)
			}else{
				addProductForm.find("input[name='favorite']").prop('checked' , false)
			}
			addProductForm.find("input[type='submit']").val("Update Product");
			addProductForm.find("#delete-product").show();
			StoreAdmin.showAdminPage("products");
		});
	});
	productsHolder.append(productBtn);
};

StoreAdmin.createNewProductBtn = function() {
	var newProductBtn = $("<div />").addClass("product-btn clickable").attr("id","new-product");
	newProductBtn.click(function(){
		StoreAdmin.clearProductForm();
	});
	$("#products-holder").append(newProductBtn);
};


StoreAdmin.clearProductForm = function() {
	var addProductForm = $("form#add-product");
	addProductForm.find("input[type='text'], select, input[type='hidden']").each(function(){
		$(this).val("");
	});
	addProductForm.find("input[name='favorite']").prop('checked' , false);
	addProductForm.find("textarea[name='desc']").text("");
	addProductForm.find("input[type='submit']").val("Add Product");
	addProductForm.find("#delete-product").hide();
};

StoreAdmin.renderCategoryDropDown = function(){
	var categoriesBtns = $(".cat-btn");
	var categorySelect = $("select#choose-cat");
	categorySelect.empty();
	categoriesBtns.each(function(){
		var catOp = $("<option />").attr("value",$(this).attr("id")).text($(this).text());
		categorySelect.append(catOp);
	});

};


StoreAdmin.bineForms = function(){
	var addCategoryForm = $("form#add-category");
	addCategoryForm.submit(function(e){
		e.preventDefault();
		var submittedForm = $(this);
		var newCatName = submittedForm.find("input[name='name']").val();
		$.post("/category",{"name":newCatName},function(result){
			if (result["STATUS"] == "ERROR"){
				alert(result["MSG"]);
			}else{
				StoreAdmin.renderCategory(newCatName,result["CAT_ID"]);
				$("body").removeClass("no-categories");
			}
		},"json");
		return false;
	});

	var addProductForm = $("form#add-product");
	addProductForm.submit(function(e){
		e.preventDefault();
		var submittedForm = $(this);
		$.post("/product",submittedForm.serialize(),function(result){
			if (result["STATUS"] == "ERROR"){
				alert(result["MSG"]);
			}else{
				StoreAdmin.loadProducts();
			}
		},"json");
		return false;
	});
	addProductForm.find("#delete-product").click(function(e){
		e.stopPropagation();
		var clickedBtn = $(this);
		pid = addProductForm.find("input[name='id']").val();
		StoreAdmin.deleteProduct(clickedBtn, pid);
	});
};

StoreAdmin.showAdminPage = function(pageToShow){
	if (pageToShow == "goto"){
		window.open("/");
	}else{
		var page = $("#" + pageToShow + "-page");
		$(".admin-page:visible").hide();
			page.show();
		
	}
};

StoreAdmin.deleteCategory = function(deleteBtn){
	deleteBtn.addClass("fa-spin")
	var categoryToDelete =  deleteBtn.closest(".cat-btn")
	var catId = categoryToDelete.attr("id").replace("cat-");
	$.ajax({
		url: '/category/' + catId,
		type: 'DELETE',
		success: function(result) {
			categoryToDelete.remove();
			$("select#choose-cat").find("option[value='"+catId+"']").remove();
			if($("select#choose-cat").find("option").length == 0){
				$("body").addClass("no-categories");
			}
		}
	});
};

StoreAdmin.deleteProduct = function(deleteBtn, pid){
	deleteBtn.find("i").addClass("fa-spin");
	$.ajax({
		url: '/product/' + pid,
		type: 'DELETE',
		success: function(result) {
			StoreAdmin.loadProducts();
			deleteBtn.find("i").removeClass("fa-spin");
		}
	});
};

StoreAdmin.start();