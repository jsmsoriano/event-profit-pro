import { useState } from 'react';
import { useWiki } from '@/hooks/useWiki';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Eye, 
  Calendar, 
  Star,
  Edit,
  Trash2,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { WikiArticle } from '@/hooks/useWiki';

interface ArticleForm {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  is_published: boolean;
  featured: boolean;
}

export default function Wiki() {
  const { 
    articles, 
    categories, 
    loading, 
    searchTerm, 
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    createArticle,
    updateArticle,
    deleteArticle,
    getFeaturedArticles,
    getRecentArticles,
    getPopularArticles
  } = useWiki();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WikiArticle | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [view, setView] = useState<'grid' | 'article'>('grid');

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<ArticleForm>();

  const handleCreateSubmit = async (data: ArticleForm) => {
    const success = await createArticle({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      is_published: data.is_published,
      featured: data.featured,
      created_by: 'current-user',
      updated_by: 'current-user',
    });

    if (success) {
      setIsCreateDialogOpen(false);
      reset();
    }
  };

  const handleEditSubmit = async (data: ArticleForm) => {
    if (!editingArticle) return;

    const success = await updateArticle(editingArticle.id, {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      is_published: data.is_published,
      featured: data.featured,
    });

    if (success) {
      setIsEditDialogOpen(false);
      setEditingArticle(null);
      reset();
    }
  };

  const openEditDialog = (article: WikiArticle) => {
    setEditingArticle(article);
    setValue('title', article.title);
    setValue('content', article.content);
    setValue('excerpt', article.excerpt || '');
    setValue('category', article.category);
    setValue('tags', article.tags.join(', '));
    setValue('is_published', article.is_published);
    setValue('featured', article.featured);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(id);
    }
  };

  const openArticle = (article: WikiArticle) => {
    setSelectedArticle(article);
    setView('article');
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'rocket': '🚀',
      'workflow': '⚙️',
      'shield': '🛡️',
      'tool': '🔧',
      'graduation-cap': '🎓',
      'help-circle': '❓',
    };
    return iconMap[iconName] || '📁';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading wiki...</div>
      </div>
    );
  }

  if (view === 'article' && selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setView('grid')}
            className="mb-4"
          >
            ← Back to Wiki
          </Button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{selectedArticle.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(selectedArticle.created_at), 'PPP')}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedArticle.view_count} views
                </div>
                <Badge variant="outline">{selectedArticle.category}</Badge>
                {selectedArticle.featured && (
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openEditDialog(selectedArticle)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDelete(selectedArticle.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedArticle.excerpt && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-lg text-muted-foreground italic">{selectedArticle.excerpt}</p>
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed">
            {selectedArticle.content}
          </div>
        </div>

        {selectedArticle.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedArticle.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const featuredArticles = getFeaturedArticles();
  const recentArticles = getRecentArticles();
  const popularArticles = getPopularArticles();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Business Wiki
          </h1>
          <p className="text-muted-foreground mt-1">
            Knowledge base and resources for team members
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {getCategoryIcon(category.icon)} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="default" className="mb-2">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2" onClick={() => openArticle(article)}>
                    {article.title}
                  </CardTitle>
                  {article.excerpt && (
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.view_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(article.created_at), 'MMM d')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Articles Grid */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">All Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{article.category}</Badge>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(article);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2" onClick={() => openArticle(article)}>
                    {article.title}
                  </CardTitle>
                  {article.excerpt && (
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.view_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(article.created_at), 'MMM d')}
                    </div>
                  </div>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Articles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="cursor-pointer hover:bg-muted/50 p-2 rounded"
                  onClick={() => openArticle(article)}
                >
                  <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(article.created_at), 'MMM d')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular Articles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="cursor-pointer hover:bg-muted/50 p-2 rounded"
                  onClick={() => openArticle(article)}
                >
                  <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.view_count} views
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded text-sm"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span>{getCategoryIcon(category.icon)}</span>
                  <span>{category.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {articles.filter(a => a.category === category.name).length}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Article Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title', { required: true })}
                placeholder="Article title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                {...register('excerpt')}
                placeholder="Brief description of the article..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select {...register('category', { required: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {getCategoryIcon(category.icon)} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  {...register('tags')}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...register('content', { required: true })}
                placeholder="Write your article content here..."
                rows={12}
                className="font-mono"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="is_published" {...register('is_published')} />
                <Label htmlFor="is_published">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="featured" {...register('featured')} />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Article'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_title">Title</Label>
              <Input
                id="edit_title"
                {...register('title', { required: true })}
                placeholder="Article title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="edit_excerpt"
                {...register('excerpt')}
                placeholder="Brief description of the article..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_category">Category</Label>
                <Select {...register('category', { required: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {getCategoryIcon(category.icon)} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_tags">Tags</Label>
                <Input
                  id="edit_tags"
                  {...register('tags')}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_content">Content</Label>
              <Textarea
                id="edit_content"
                {...register('content', { required: true })}
                placeholder="Write your article content here..."
                rows={12}
                className="font-mono"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="edit_is_published" {...register('is_published')} />
                <Label htmlFor="edit_is_published">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit_featured" {...register('featured')} />
                <Label htmlFor="edit_featured">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}