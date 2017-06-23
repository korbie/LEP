suite('About page tests',function(){
	test('page should have link to contacts page',function(){
		assert($('a[href="/contact"]').length);
	});
});