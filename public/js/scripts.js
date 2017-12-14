// Modification to Backbone to use take the 'id's as '_id's
Backbone.Model.prototype.idAttribute = '_id';

// Backbone Model
var Blog = Backbone.Model.extend({
    defaults: {
        author: '',
        title: '',
        url: '',
    }
})



// Backbone Collection
var Blogs = Backbone.Collection.extend({
    url: 'http://localhost:3000/api/blogs'
});

var blogs = new Blogs();



// Backbone View for one blog
var BlogView = Backbone.View.extend({

    // Custom var to store the fields that matters in every row
    _fields: ['author', 'title', 'url'],

    model: new Blog(),
    tagName: 'tr',
    events: {
        'click .edit-blog': 'edit',
        'click .delete-blog': 'delete',
        'click .update-blog': 'update',
        'click .cancel-blog': 'cancel',
    },
    initialize: function(){

        // Set the template to be used for every row
        this.template = _.template($('.blogs-list-template').html())

        // Set a listener to render the row every time the model underneath changes
        this.model.on('change', this.render, this);
    },
    edit: function () {

        // Adjust buttons (only in local row)
        this.$('.edit-blog').hide();
        this.$('.delete-blog').hide();
        this.$('.update-blog').show();
        this.$('.cancel-blog').show();

        // Replace the plain text by input text fields
        _.each(this._fields, function (field) {
            var value = this.$('.' + field).html();
            this.$('.' + field).html('<input type="text" value="' + value + '" class="' + field + '-update"</input>');
        }, this);
    },
    delete: function () {
        this.model.destroy({
            success: function(response) {
                console.log('Successfully DELETED blog with _id: ' + response.toJSON()._id);
            },
            error: function(err) {
                console.log('Failed to delete blog!');
            }
        });
    },
    update: function () {
        
        // Get values from the input fields
        var values = {};
        _.each(this._fields, function (field) {
            var newValue = this.$('.' + field + '-update').val();
            values[field] = newValue;
        });

        // Update model
        // ...locally
        this.model.set(values);

        // ...and in the db
        this.model.save(null, {
            success: function (response) {
                console.log('Successfuly saved blog with _id: ' + response.toJSON()._id);
            },
            error: function (response) {
                console.log('Error creating the blog in the db');
            }
        });

        // Restore Read-Only Mode of the row
        this.render();
    },
    cancel: function () {
        this.render();
    },
    render: function () {

        // Replace the html of the current element (tr) with the result of evaluating the template with the given model
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
})



// Backbone View for all blogs
var BlogsView = Backbone.View.extend({
    model: blogs,
    el: $('.blogs-list'),
    initialize: function(){

        // The model (blogs) will listen to "on add" events. So every time an element is added to the collection
        // the given function will be called
        this.model.on('add', this.render, this);
        this.model.on('remove', this.render, this);
        this.model.fetch({
            success: function(response) {
                _.each(response.toJSON(), function(item) {
                    console.log('Successfully GOT blog with _id: ' + item._id);
                })
            },
            error: function() {
                console.log('Failed to get blogs!');
            }
        });
    },
    render: function() {
        var self = this;
        this.$el.html('');
        _.each(this.model.toArray(), function(blog) {
            self.$el.append((new BlogView({model: blog})).render().$el);
        });
        return this;
    },
});

var blogsView = new BlogsView();

// When the page is ready, the button with class "add-blog" will listen to "on click" events. Every time the event is
// is triggered a blog is created with the data form the inputs
$(document).ready(function () {
    $('.add-blog').on('click', function () {
        var blog = new Blog({
            author: $('.author-input').val(),
            title: $('.title-input').val(),
            url: $('.url-input').val()
        });

        // Clear inputs
        $('.author-input').val('');
        $('.title-input').val('');
        $('.url-input').val('');
        console.log(blog.toJSON());

        blogs.add(blog);

        blog.save(null, {
            success: function (response) {
                console.log('Successfuly saved blog with _id: ' + response.toJSON()._id);
            },
            error: function (response) {
                console.log('Error creating the blog in the db');
            }
        });
    })
});
