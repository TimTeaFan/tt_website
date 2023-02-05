---
output:
  hugodownplus::md_document:
    use_boxes: TRUE
    toc: TRUE
# Documentation: https://sourcethemes.com/academic/docs/managing-content/

title: "The ultimate guide to ordering rows in R"
subtitle: ""
summary: "This blog post shows how to order rows in a dataframe using four different approaches: base R, data.table, dplyr, and python's pandas."
authors: []
tags: ["R", "python", "dplyr", "base R", "data.table", "pandas"]
categories: ["R", "Python", "base R", "dplyr", "data.table", "pandas"]
date: 2023-02-02
lastmod: 2023-02-02
featured: false
draft: false

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
# Focal points: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight.
image:
  caption: ""
  focal_point: ""
  preview_only: false

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects: []
rmd_hash: e3fc4871924730e6

---

-   <a href="#intro" id="toc-intro">Intro</a>
-   <a href="#setup" id="toc-setup">Setup</a>
-   <a href="#base-r" id="toc-base-r">base R</a>
-   <a href="#datatable" id="toc-datatable">‘data․table’</a>
-   <a href="#dplyr" id="toc-dplyr">dplyr</a>
-   <a href="#pandas" id="toc-pandas">pandas</a>
-   <a href="#wrap-up" id="toc-wrap-up">Wrap-up</a>

## Intro

Sorting rows in a `data.frame` is generally considered a straightforward task, which it mostly is - until it isn't. It seems that the operation of ordering rows doesn't get much attention in introductory books on data science. Both <a href="https://r4ds.had.co.nz/transform.html#arrange-rows-with-arrange" role="highlight">R for Data Science</a> and <a href="https://wesmckinney.com/book/pandas-basics.html#pandas_sorting" role="highlight">Python for Data Analysis</a> only touch the subject very briefly. So this post comes to the rescue.

Below we look at several ordering operations and examine how the three big paradigms in R, base R, 'data.table' and 'dplyr', compare in tackling different ordering operations.

We will look at seven challenges loosely ordered by their increasing complexity.

We are going to order rows according to ...

1.  ... one or several columns in ascending or descending order.
2.  ... a character vector with matching names.
3.  ... a simple expression.
4.  ... a complex expression.
5.  ... all columns in a `data.frame`.
6.  ... a vector of column names.
7.  ... a vector of matching patterns.

This post concludes by comparing how we would tackle the same problems in Python's 'pandas' library.

Let's start with the setup.

## Setup

We take R's built-in `mtcars` data, extract a couple of rows and columns to make it more compact, and introduce some `NA`s to get an understanding of what's happening when the data includes missing values.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"cyl"</span>, <span class='s'>"vs"</span>, <span class='s'>"gear"</span>, <span class='s'>"mpg"</span>, <span class='s'>"disp"</span><span class='o'>)</span></span>
<span><span class='nv'>myrows</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/which.html'>which</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>mtcars</span><span class='o'>)</span> <span class='o'><a href='https://rdrr.io/r/base/match.html'>%in%</a></span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Cadillac Fleetwood"</span>, <span class='s'>"Honda Civic"</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>mycars</span> <span class='o'>&lt;-</span> <span class='nv'>mtcars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='m'>1</span><span class='o'>:</span><span class='m'>10</span>, <span class='nv'>myrows</span><span class='o'>)</span>, <span class='nv'>mycols</span><span class='o'>]</span></span>
<span></span>
<span><span class='nv'>mycars</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span>model <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span>,</span>
<span>                     <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span><span class='nv'>mycars</span>, row.names<span class='o'>=</span><span class='kc'>NULL</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span> <span class='o'><a href='https://rdrr.io/r/base/match.html'>%in%</a></span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Cadillac Fleetwood"</span>, <span class='s'>"Honda Civic"</span><span class='o'>)</span>, <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"mpg"</span>, <span class='s'>"disp"</span><span class='o'>)</span><span class='o'>]</span> <span class='o'>&lt;-</span> <span class='kc'>NA</span></span>
<span></span>
<span><span class='nv'>mycars</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Finally let's save this data to a csv file which we will read in later in Python:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/utils/write.table.html'>write.csv</a></span><span class='o'>(</span><span class='nv'>mycars</span>, <span class='s'>"mycars.csv"</span><span class='o'>)</span></span>
<span><span class='c'># available at:</span></span>
<span><span class='c'># read.csv("https://raw.githubusercontent.com/TimTeaFan/tt_website/main/content/post/2023-ordering-rows/mycars.csv")</span></span></code></pre>

</div>

## base R

#### 1. Ordering by one or several variables

Ordering rows of a `data.frame` in base R is simple: we subset the rows of a `data.frame` with the [`order()`](https://rdrr.io/r/base/order.html) function called on one or more variables.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># order by one column ascending</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span><span></span>
<span><span class='c'># order by two columns, first descending, second ascending:</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='o'>-</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>cyl</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Important to note is that, as default, `NA`s are sorted to bottom of the `data.frame` (read more about sorting `NA` values below).

<div class="info-box" title="Ordering rows containing NAs">

Base R's [`order()`](https://rdrr.io/r/base/order.html) has an argument `na.last` which is set to `TRUE` by default and sorts `NA` to the bottom:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Setting `na.last = FALSE` sorts `NA`s to the top:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, na.last <span class='o'>=</span> <span class='kc'>FALSE</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span></span></code></pre>

</div>

A bit surprisingly `na.last` can also be set `NA` which will remove `NA`s from the vector or `data.frame` making it a combined filter and ordering operation:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, na.last <span class='o'>=</span> <span class='kc'>NA</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 6            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 5  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 10          Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 1          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 4     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 3         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8          Merc 240D   4  1    4 24.4 146.7</span></span>
<span></span></code></pre>

</div>

For some users this behavior might not be very intuitive, which is why splitting ordering and filtering operations is preferable for code clarity.

This is especially relevant for users coming from 'dplyr' or 'data.table'. [`dplyr::arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) always orders `NA`s last and doesn't come with an option to change this behavior. [`data.table::setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) has an argument `na.last`, but (1) it can only be set `TRUE` or `FALSE` and (2) it defaults to the former which is the opposite of what [`base::order()`](https://rdrr.io/r/base/order.html) does:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycarsDT</span> <span class='o'>&lt;-</span> <span class='nf'>data.table</span><span class='nf'>::</span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/as.data.table.html'>as.data.table</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span>
<span><span class='nf'>data.table</span><span class='nf'>::</span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nv'>mpg</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt;  2:        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt;  3:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  4:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  5:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  6:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  7:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  8:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  9:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 10:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 11:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 12:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span></span></code></pre>

</div>

</div>

How different vector types are sorted and some more information about what exactly happens, when we call `df[order(variable), ]` can be found in the info box below.

<div class="info-box" title="The logic of ordering rows in base R">

How does the above syntax work? Lets look at a three-column `data.frame`

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/data.frame.html'>data.frame</a></span><span class='o'>(</span>x <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='m'>100</span>, <span class='m'>1</span>, <span class='m'>10</span><span class='o'>)</span>, y <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"a"</span>, <span class='s'>"c"</span>, <span class='s'>"b"</span><span class='o'>)</span>, z <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='kc'>TRUE</span>, <span class='kc'>FALSE</span>, <span class='kc'>TRUE</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>dat</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span></span></code></pre>

</div>

The output of `order(dat$x)` shows us the row numbers in which we would have to order our `data.frame` to make the values in `dat$x` run from smallest to highest.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>x</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; [1] 2 3 1</span></span>
<span></span></code></pre>

</div>

We can read this as: "The second row should come first, the third row should come second, and the first row should come last". To actually order the rows according to this logic, we subset the `data.frame` by its rows according to the logic `df[row_index, ]`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span> <span class='o'>&lt;-</span> <span class='nv'>dat</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>x</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='nv'>dat</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span></span></code></pre>

</div>

Now the rows are in the desired order, but note, that the row indices still correspond to the original indices. This makes it (relatively) easy to restore the old ordering:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span> <span class='o'>&lt;-</span> <span class='nv'>dat</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/numeric.html'>as.numeric</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/colnames.html'>rownames</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='nv'>dat</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span></span></code></pre>

</div>

Note hat the logic of ordering is the same for the most common data types. [`order()`](https://rdrr.io/r/base/order.html) sorts the values from smallest to largest. For `integer` and `double` vectors (including `Date`s and date times, like `POSIXct`) this is pretty straightforward. Also for `character` vectors the logic is simple: `"a"` is "smaller" than `"b"`, so the ascending order goes from A to Z, with small coming before capital letters. We can always verify how character values relate:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='s'>"a"</span> <span class='o'>&gt;</span> <span class='s'>"A"</span></span>
<span><span class='c'>#&gt; [1] FALSE</span></span>
<span></span></code></pre>

</div>

For `logical` vectors `FALSE` can be read as `0` and `TRUE` as `1` which is the ascending order in which the values will be sorted. Although this makes perfectly sense, given that this is the way logical vectors are coerced to numeric, we will see later that this might be confusing when specifying explict values to sort by.

Finally, the only special case are `factor` variables. Here the sorting follows the factor [`levels()`](https://rdrr.io/r/base/levels.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>y</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>y</span>, levels <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"b"</span>, <span class='s'>"a"</span>, <span class='s'>"c"</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>dat</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>dat</span><span class='o'>$</span><span class='nv'>y</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;     x y     z</span></span>
<span><span class='c'>#&gt; 3  10 b  TRUE</span></span>
<span><span class='c'>#&gt; 1 100 a  TRUE</span></span>
<span><span class='c'>#&gt; 2   1 c FALSE</span></span>
<span></span></code></pre>

</div>

</div>

#### 2. Ordering by a character vector with matching names

Sometimes sorting by `numeric` and `character` variables in ascending or descending order is not enough. There are cases where we have a given non-alphabetical order of names which we want to apply to our data. In this case we use `factor` variables.

Let's assume we have a given order of model names that we want to sort our data by. Then we have two choices. We either transform the `mycars$model` column into a `factor` and supply our desired order of names as factor `levels` (see info box: "the logic of ordering rows" above).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># a character vector with matching names</span></span>
<span><span class='nv'>my_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Hornet Sportabout"</span>, <span class='s'>"Cadillac Fleetwood"</span>, <span class='s'>"Valiant"</span>,</span>
<span>            <span class='s'>"Hornet 4 Drive"</span>, <span class='s'>"Mazda RX4"</span>, <span class='s'>"Mazda RX4 Wag"</span>, <span class='s'>"Honda Civic"</span>,</span>
<span>            <span class='s'>"Datsun 710"</span>, <span class='s'>"Duster 360"</span>, <span class='s'>"Merc 240D"</span>, <span class='s'>"Merc 230"</span>, <span class='s'>"Merc 280"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars2</span> <span class='o'>&lt;-</span> <span class='nv'>mycars</span> <span class='c'># let's create a new copy</span></span>
<span></span>
<span><span class='c'># transform model column into factor and use level from my_vec</span></span>
<span><span class='nv'>mycars2</span><span class='o'>$</span><span class='nv'>model</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>mycars2</span><span class='o'>$</span><span class='nv'>model</span>, levels <span class='o'>=</span> <span class='nv'>my_vec</span><span class='o'>)</span> </span>
<span></span>
<span><span class='nv'>mycars2</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars2</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span></span></code></pre>

</div>

However, we might not want to transform our original data and rather leave our `model` column untouched. In this case we can construct a factor variable "on the fly" and use it within [`order()`](https://rdrr.io/r/base/order.html) without changing the `data.frame` itself:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span>, levels <span class='o'>=</span> <span class='nv'>my_vec</span><span class='o'>)</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span></span></code></pre>

</div>

#### 3. Ordering by a simple expression

Apart from sorting according to one or more variables, sometimes we want to sort according to a specific expression. Let's say we want the row `"Hornet Sportabout"` to be sorted to the top of our `data.frame`. In this case, we can construct a logical vector `mycars$model != "Hornet Sportabout"` returning `TRUE` and `FALSE` for each row. Passing this to [`order()`](https://rdrr.io/r/base/order.html) yields the desired result:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># bring one column to the top / bottom</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span> <span class='o'>!=</span> <span class='s'>"Hornet Sportabout"</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Note, that we negate the comparison with `!=`, since `logical` vectors are sorted from `FALSE` to `TRUE` (see info box "the logic of ordering rows" above).

#### 4. Ordering by complex expressions

Above we saw how to order a `data.frame` by a simple logical expression. In base R we can easily extent this approach and apply more complex expressions within [`order()`](https://rdrr.io/r/base/order.html). Let's say, for example, we want to sort our data in two groups, cars with 'v-shaped engines' `vs == 1` and those with 'straight engines' `vs == 1`. In the first group we want to order the rows by `mpg` in decreasing order, and in the second group we want to order `mpg` in increasing order.

In this case we can supply `mycars$vs` as first argument to [`order()`](https://rdrr.io/r/base/order.html) followed by the literal `ifelse` expression of the condition outlined above:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># ordering by one group and an ifelse expression on a numeric column</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='o'>-</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

The reason why this ordering operation yields the desired output, is because `mycars$mpg` is a numeric variable that only contains positive values, so we can reverse the values within the `ifelse` clause by just prefixing `mpg` with a minus symbol `-`.

So basically we are sorting by this vector which we generate on the fly:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='o'>-</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span><span class='o'>)</span></span>
<span><span class='c'>#&gt;  [1]  21.0  21.0 -22.8 -21.4  18.7 -18.1  14.3 -24.4 -22.8 -19.2    NA    NA</span></span>
<span></span></code></pre>

</div>

Let's say we want to order the `model` names in ascending and descending order based on the engine shape `vs`. In this case we first need to transform the `model` column into a rank for which we can use [`base::xtfrm()`](https://rdrr.io/r/base/xtfrm.html). Then we can just reverse the so generated ranks using the minus symbol `-`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># ordering by one group and an ifelse expression on a character column</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span>,</span>
<span>             <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>,</span>
<span>                    <span class='o'>-</span><span class='nf'><a href='https://rdrr.io/r/base/xtfrm.html'>xtfrm</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span>,</span>
<span>                    <span class='nf'><a href='https://rdrr.io/r/base/xtfrm.html'>xtfrm</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span></span>
<span>                    <span class='o'>)</span></span>
<span>             <span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span></span></code></pre>

</div>

As we will see later, other libraries also have trouble handling special ordering operations with complex expressions like this.

#### 5. Ordering by all columns of a data.frame

Another common operation is to order by all variables in a `data.frame`. For our toy data this means we want to first sort `cyl` from `4` to `8`, within `cyl` we want the rows to be sorted according to `vs` and ties here should be sorted according to `gear`, `mpg` and then `disp`.

We could just write out all variables as we did in the examples above:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>cyl</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>vs</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>gear</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>disp</span><span class='o'>)</span>,<span class='o'>]</span></span></code></pre>

</div>

However, this is a lot of typing. Ideally we'd prefer a more programmatic way of sorting a `data.frame` by all variables. In base R, we can do this with `do.call("order", args = list_of_vectors_to_sort_by)`. `do.call` basically constructs and evaluates a call to the specified function, here `"order"`, and passes the `list` in the `args` argument to the arguments of the specified call.

In our case the list of vectors to sort by is the `mycars` `data.frame` itself except for the first column `model`, hence `mycars[,-1]`. Since we want to pass our list of vectors to `order`'s ellipsis `...` argument, the vectors in our `list` should be unnamed: `unname(mycars[,-1])`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># order by all columns ascending</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>[</span>, <span class='o'>-</span><span class='m'>1</span><span class='o'>]</span><span class='o'>)</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span></span></code></pre>

</div>

Forgetting to [`unname()`](https://rdrr.io/r/base/unname.html) our list of vectors will cause trouble if one of the column names corresponds to an argument of [`order()`](https://rdrr.io/r/base/order.html): `na.last`, `decreasing` and `method`. In this case `do.call` will pass the values of this column to the corresponding argument, throwing an error in the best case, or doing something we don't expect (and notice) in the worst.

#### 6. Ordering by a list or vector of column names

Similar to sorting a `data.frame` by all variables, we sometimes have a vector of variables names we want to sort by. Here we can apply the same approach as above and use `do.call("order", my_df[,mycols])` on our `data.frame`. Let's further assume that we want to sort some columns ascending and some descending.

In this case we combine both arguments, the vectors to sort by and their decreasing order, in a list and supply it to `do.call("order", our_list_of_arguments)`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># Let's say we have the names of the columns ...</span></span>
<span><span class='c'># ... we want to order by in a vector</span></span>
<span><span class='nv'>mycols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"mpg"</span>, <span class='s'>"cyl"</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># Then we need to construct the arguments in list form ...</span></span>
<span><span class='c'># 1. only the values of the columns to sort by (therefore `unname()`)</span></span>
<span><span class='nv'>sort_df</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>[</span>,<span class='nv'>mycols</span><span class='o'>]</span><span class='o'>)</span></span>
<span><span class='c'># 2. the logical values for `order()`s `decreasing` argument:</span></span>
<span><span class='nv'>desc_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span>decreasing <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='kc'>TRUE</span>, <span class='kc'>FALSE</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># we combine the arguments inside `do.call()`</span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='nv'>sort_df</span>, <span class='nv'>desc_ls</span><span class='o'>)</span><span class='o'>)</span>,<span class='o'>]</span></span>
<span></span>
<span><span class='c'># the above is equivalent to </span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='o'>-</span><span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>mpg</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>cyl</span><span class='o'>)</span>,<span class='o'>]</span></span></code></pre>

</div>

#### 7. Ordering by a vector of matching patterns

In our last example we look at how to order a `data.frame` according to a vector of matching patterns. Let's say we want to list all 'Mazda', 'Merc' and 'Hornet' cars first (in this order), and all other cars last. In this case, we can again use `do.call("order", ...)`. As input we need a list of vectors checking if the specified pattern can be found in each row.

To do this we check with [`grepl()`](https://rdrr.io/r/base/grep.html) if `mycars$model` starts with (regex: `^`) one of the three names `"Mazda"`, `"Merc"` or `"Hornet"`. Wrapping this in `lapply` gives us a list of logical vectors that we can use as arguments to our `do.call`. Since logical values are sorted from `FALSE` to `TRUE` we negate `grepl` with `!` to sort those rows to the top.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># order by matching pattern</span></span>
<span><span class='nv'>my_pattern</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Mazda"</span>, <span class='s'>"Merc"</span>, <span class='s'>"Hornet"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>idx_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/lapply.html'>lapply</a></span><span class='o'>(</span><span class='nv'>my_pattern</span>,</span>
<span>                 \<span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span> <span class='o'>!</span><span class='nf'><a href='https://rdrr.io/r/base/grep.html'>grepl</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"^"</span>, <span class='nv'>x</span><span class='o'>)</span>, <span class='nv'>mycars</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nv'>idx_ls</span><span class='o'>)</span>, <span class='o'>]</span></span>
<span><span class='c'>#&gt;                 model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt; 1           Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 2       Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt; 8           Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 9            Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 4      Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 5   Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt; 3          Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt; 6             Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 7          Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 11 Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

#### Summing up: Ordering rows in base R

Ordering in base R boils down to subsetting a `data.frame` by itself in a different order. We create this new order either by applying [`order()`](https://rdrr.io/r/base/order.html) directly to one or several variables or expressions, or by wrapping it in a [`do.call()`](https://rdrr.io/r/base/do.call.html) together with a list of arguments.

While the former can be considered an easy, straightforward operation, the later requires quite some knowledge about constructing calls with [`do.call()`](https://rdrr.io/r/base/do.call.html) and the possible pitfalls we might encounter - think of: [`unname()`](https://rdrr.io/r/base/unname.html). Nevertheless, once useRs have understood the advanced concept of [`do.call()`](https://rdrr.io/r/base/do.call.html) and how to use it, more advanced ordering operations can be tackled easily well.

## 'data․table'

When it comes to orderings rows 'data.table' is not much different than base R. Most of the ordering operations introduced above can be applied almost identically on a `data.table`. While the syntax resembles base R, 'data.table' is using its own implementation of [`order()`](https://rdrr.io/r/base/order.html) under the hood, `data.table:::forder()`, which is optimized and much faster compared to base R.

In this section we will first look at how to use [`order()`](https://rdrr.io/r/base/order.html) on the seven examples from above. The aim is to stay close to base R, but account for 'data.table's syntax specific features.

Apart from [`order()`](https://rdrr.io/r/base/order.html), 'data.table' comes with its two own ordering functions, [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) and [`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html), which modify a data.table object by reference - that is without making a copy. This makes them more memory efficient compared to the already optimized implementation of `data.table:::forder()`.

The following code chucks use a `data.table` version of our data:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://r-datatable.com'>data.table</a></span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycarsDT</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/as.data.table.html'>as.data.table</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span></code></pre>

</div>

#### data.table specific syntax

One decisive difference between base R is that 'data.table' supports non-standard evaluation (NSE) within the subsetting / extracting `[` expression.

This means we can refer bare column names like `mpg` instead of `mycarsDT$mpg`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span>, <span class='o'>]</span> <span class='c'># &lt;-- this would throw an error in base R</span></span></code></pre>

</div>

Further, in data.table's extraction function `[` the `j` argument is optional, which is why we don't need the trailing comma:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span><span class='o'>]</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  2:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt;  3:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  4:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  5:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  6:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  7:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  8:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  9:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt; 10:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt; 11: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12:        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Note that, unlike [`base::order()`](https://rdrr.io/r/base/order.html), 'data.table's implementation doesn't keep track of the ordered rows. The `rownames` range from `1` to `12` like before (in base R the `rownames` showed for each row where it was originally coming from, allowing us to restore the order).

With the above syntax features in mind, we can rewrite the first five ordering examples as follows:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 1. Ordering by one or several variables</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span><span class='o'>]</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='o'>-</span><span class='nv'>cyl</span>, <span class='nv'>mpg</span><span class='o'>)</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># 2. Ordering by a character vector with matching names</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>model</span>, levels <span class='o'>=</span> <span class='nv'>my_vec</span><span class='o'>)</span><span class='o'>)</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># 3. Ordering by a simple expression</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>model</span> <span class='o'>!=</span> <span class='s'>"Hornet Sportabout"</span><span class='o'>)</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># 4. Ordering by a complex expression (positive numeric column)</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>vs</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='o'>-</span><span class='nv'>mpg</span>, <span class='nv'>mpg</span><span class='o'>)</span><span class='o'>)</span><span class='o'>]</span></span>
<span><span class='c'># 4. Ordering by a complex expression (character column)</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/order.html'>order</a></span><span class='o'>(</span><span class='nv'>vs</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='o'>-</span><span class='nf'><a href='https://rdrr.io/r/base/xtfrm.html'>xtfrm</a></span><span class='o'>(</span><span class='nv'>model</span><span class='o'>)</span>, <span class='nf'><a href='https://rdrr.io/r/base/xtfrm.html'>xtfrm</a></span><span class='o'>(</span><span class='nv'>model</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># 5. Ordering by all columns of a data.frame</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>[</span>, <span class='o'>-</span><span class='m'>1</span><span class='o'>]</span><span class='o'>)</span><span class='o'>)</span><span class='o'>]</span></span></code></pre>

</div>

Note that the code chunk above shows only the ordering operation without assignment. To actually transform the `data.table` object we would need to assign the calls above to a new (or the same) object name.

When using a vector of column names to subset a `data.table`, as we did in the sixth example, we need to precede the vector containing the column names (here: `mycol`) with a double dot `..` to tell 'data.table' that we are looking for an external vector and not a column named `mycol` inside our `data.table`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 6. Ordering by a list or vector of column names</span></span>
<span><span class='nv'>mycols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"mpg"</span>, <span class='s'>"cyl"</span><span class='o'>)</span></span>
<span><span class='nv'>sort_df</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/unname.html'>unname</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>[</span>, <span class='nv'>..mycols</span><span class='o'>]</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nv'>sort_df</span><span class='o'>)</span><span class='o'>]</span></span></code></pre>

</div>

However, our base R example was a bit more complex, since we also provided a logical vector to [`order()`](https://rdrr.io/r/base/order.html)s `decreasing` argument. 'data.table's implementation of [`order()`](https://rdrr.io/r/base/order.html), `data.table:::forder()`, does only allow vectors of length one, which is why we can't reproduce the full example from above using [`do.call()`](https://rdrr.io/r/base/do.call.html) inside `mycarsDT`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>desc_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span>decreasing <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='kc'>TRUE</span>, <span class='kc'>FALSE</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='nv'>sort_df</span>, <span class='nv'>desc_ls</span><span class='o'>)</span><span class='o'>)</span><span class='o'>]</span></span>
<span><span class='c'>#&gt; Error: isTRUEorFALSE(decreasing) is not TRUE</span></span>
<span></span></code></pre>

</div>

We will see below, that there is a better way of achieving the desired outcome. Finally, our last example can again be reproduced very similar to our base R approach.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 7. Ordering by a vector of matching patterns</span></span>
<span><span class='nv'>my_pattern</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Mazda"</span>, <span class='s'>"Merc"</span>, <span class='s'>"Hornet"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>idx_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/lapply.html'>lapply</a></span><span class='o'>(</span><span class='nv'>my_pattern</span>,</span>
<span>                 \<span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span> <span class='o'>!</span><span class='nf'><a href='https://rdrr.io/r/base/grep.html'>grepl</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"^"</span>, <span class='nv'>x</span><span class='o'>)</span>, <span class='nv'>mycarsDT</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycarsDT</span><span class='o'>[</span><span class='nf'><a href='https://rdrr.io/r/base/do.call.html'>do.call</a></span><span class='o'>(</span><span class='s'>"order"</span>, <span class='nv'>idx_ls</span><span class='o'>)</span><span class='o'>]</span></span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  2:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  3:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt;  4:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt;  5:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt;  6:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt;  7:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  8:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  9:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 10:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt; 11: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt; 12:        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

#### data.table's setorder functions

'data.table' comes with its own two ordering functions, [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) and [`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html), which modify a data.table object "by reference", that is without making a copy. This is especially helpful when we are dealing with data that takes up a lot of memory and where we want to avoid unnecessary copies.

As first argument, `x`, both functions take a `data.table`. As second argument [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) uses the ellipsis `...` which allows us to supply one or several bare column names to order by. [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) sorts in ascending order as default and allows the minus symbol `-` as prefix to sort a column in decreasing order. [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) can be straight forward applied to our first example:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 1. Ordering by one or several variables</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nv'>mpg</span><span class='o'>)</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='o'>-</span><span class='nv'>mpg</span>, <span class='nv'>cyl</span>, na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span></code></pre>

</div>

[`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html)s second argument is `cols` which takes a character vector of column names and defaults to the column names of the `data.table` supplied in `x`. To specify an ascending or descending order we can supply a numeric vector of `1` and `-1` to the `order` argument. [`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) can be applied to the examples 5. (ordering by all columns) and 6. (ordering by a vector of column names):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 5. Ordering by all columns of a data.frame</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorderv</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>,</span>
<span>          cols <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span><span class='o'>)</span><span class='o'>[</span><span class='o'>-</span><span class='m'>1</span><span class='o'>]</span>,</span>
<span>          na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># 6. Ordering by a list or vector of column names</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorderv</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>,</span>
<span>          cols <span class='o'>=</span> <span class='nv'>mycols</span>,</span>
<span>          order <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='o'>-</span><span class='m'>1</span>,<span class='m'>1</span><span class='o'>)</span>,</span>
<span>          na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span></code></pre>

</div>

Unlike [`base::order()`](https://rdrr.io/r/base/order.html), both functions default to sorting `NA`s first. We need to set `na.last = TRUE` to reproduce our base R examples from above.

Unfortunately, [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) doesn't support arbitrary expressions in the ellipsis `...`. We must only use bare column names and, optionally, a minus symbol as prefix `-`. All other expressions will throw an error. Similarly, [`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) only accepts a character vector of column names. So there is no straightforward way to apply either function to the examples 2., 3., 4. and 7. from above.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># Examples 2., 3. and 4. aren't working:</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>model</span>, levels <span class='o'>=</span> <span class='nv'>my_vec</span><span class='o'>)</span>, na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; Error in setorderv(x, cols, order, na.last): some columns are not in the data.table: factor,my_vec</span></span>
<span></span><span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nv'>model</span> <span class='o'>!=</span> <span class='s'>"Hornet Sportabout"</span>, na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; Error in setorderv(x, cols, order, na.last): some columns are not in the data.table: !=,Hornet Sportabout</span></span>
<span></span><span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span><span class='nv'>mycarsDT</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='o'>-</span><span class='nv'>mpg</span>, <span class='nv'>mpg</span><span class='o'>)</span>, na.last <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; Error in setorderv(x, cols, order, na.last): some columns are not in the data.table: ifelse,vs == 1,-mpg</span></span>
<span></span></code></pre>

</div>

We can, however, come up with a workaround to harness 'data.table's power of memory efficiently modifying a `data.table` by reference.

In all four example the workaround is the same. We use [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) and pass a modified `data.table` to it in which we create a new (or several) column(s) by reference. This new column contains the ordering logic. We use the extraction function `[` right after [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) to again delete the newly created column(s).

Let's take a look at example 3., ordering by a simple logicl expression.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 3. Ordering by a simple expression</span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorder</a></span><span class='o'>(</span></span>
<span>  <span class='nv'>mycarsDT</span><span class='o'>[</span>, <span class='nv'>ord</span> <span class='o'>:=</span> <span class='nv'>model</span> <span class='o'>!=</span> <span class='s'>"Hornet Sportabout"</span><span class='o'>]</span>,</span>
<span>  <span class='nv'>vs</span>,</span>
<span>  <span class='nv'>ord</span>,</span>
<span>  na.last <span class='o'>=</span> <span class='kc'>TRUE</span></span>
<span>  <span class='o'>)</span><span class='o'>[</span>, <span class='nv'>ord</span> <span class='o'>:=</span> <span class='kc'>NULL</span><span class='o'>]</span></span>
<span></span>
<span><span class='c'># setorder() doesn't return the data, but changes it "in place"</span></span>
<span><span class='c'># so to look at the reordered data we have to print it:</span></span>
<span><span class='nv'>mycarsDT</span> </span>
<span><span class='c'>#&gt;                  model cyl vs gear  mpg  disp</span></span>
<span><span class='c'>#&gt;  1:  Hornet Sportabout   8  0    3 18.7 360.0</span></span>
<span><span class='c'>#&gt;  2:          Mazda RX4   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  3:      Mazda RX4 Wag   6  0    4 21.0 160.0</span></span>
<span><span class='c'>#&gt;  4:         Duster 360   8  0    3 14.3 360.0</span></span>
<span><span class='c'>#&gt;  5: Cadillac Fleetwood   8  0    3   NA    NA</span></span>
<span><span class='c'>#&gt;  6:          Merc 240D   4  1    4 24.4 146.7</span></span>
<span><span class='c'>#&gt;  7:         Datsun 710   4  1    4 22.8 108.0</span></span>
<span><span class='c'>#&gt;  8:           Merc 230   4  1    4 22.8 140.8</span></span>
<span><span class='c'>#&gt;  9:     Hornet 4 Drive   6  1    3 21.4 258.0</span></span>
<span><span class='c'>#&gt; 10:           Merc 280   6  1    4 19.2 167.6</span></span>
<span><span class='c'>#&gt; 11:            Valiant   6  1    3 18.1 225.0</span></span>
<span><span class='c'>#&gt; 12:        Honda Civic   4  1    4   NA    NA</span></span>
<span></span></code></pre>

</div>

Exchanging the expression after the walrus operator `:=` allows us to apply this approach to the other examples, like ordering by factor levels on the fly `factor(model, levels = my_vec)` or by a complex expression like `ifelse(vs == 1, -mpg, mpg)`.

The approach above can be slightly adapted to help us with example no. 7, ordering by a vector of matching patterns. Here we first create three new variable names to order by `order_cols <- paste0("ord", 1:3)`. Then we use [`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html), pass a modified version of the `mycarsDT` to it, in which we actually create our three new `order_cols`. The `lapply` call on the right side of the walrus operator is the same as from our base R example above. We tell `setorderv` to order by our newly created columns and then delete those columns again right after the execution of [`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) with `[, (order_cols) := NULL]`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 7. Ordering by a vector of matching patterns</span></span>
<span><span class='nv'>order_cols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"ord"</span>, <span class='m'>1</span><span class='o'>:</span><span class='m'>3</span><span class='o'>)</span></span>
<span></span>
<span><span class='nf'><a href='https://Rdatatable.gitlab.io/data.table/reference/setorder.html'>setorderv</a></span><span class='o'>(</span></span>
<span>  <span class='nv'>mycarsDT</span><span class='o'>[</span>, <span class='o'>(</span><span class='nv'>order_cols</span><span class='o'>)</span> <span class='o'>:=</span></span>
<span>             <span class='nf'><a href='https://rdrr.io/r/base/lapply.html'>lapply</a></span><span class='o'>(</span><span class='nv'>my_pattern</span>, \<span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span> <span class='o'>!</span><span class='nf'><a href='https://rdrr.io/r/base/grep.html'>grepl</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"^"</span>, <span class='nv'>x</span><span class='o'>)</span>, <span class='nv'>model</span><span class='o'>)</span><span class='o'>)</span><span class='o'>]</span>,</span>
<span>  cols <span class='o'>=</span> <span class='nv'>order_cols</span>,</span>
<span>  na.last <span class='o'>=</span> <span class='kc'>TRUE</span></span>
<span>  <span class='o'>)</span><span class='o'>[</span>, <span class='o'>(</span><span class='nv'>order_cols</span><span class='o'>)</span> <span class='o'>:=</span> <span class='kc'>NULL</span><span class='o'>]</span></span></code></pre>

</div>

#### Summing up: Ordering rows with 'data.table'

Above we saw that using [`order()`](https://rdrr.io/r/base/order.html) on `data.table` is very similar to using [`order()`](https://rdrr.io/r/base/order.html) on a `data.frame` in base R. Due to 'data.table's special syntax the calls are less verbose and thanks to its own implementation of [`order()`](https://rdrr.io/r/base/order.html) the performance is much faster compared to base R.

With [`order()`](https://rdrr.io/r/base/order.html) all but one of the challenges from above could be tackled. The only problem we encountered was that `data.table:::forder()` doesn't allow vectors of length greater than one in the `decreasing` argument.

Apart from [`order()`](https://rdrr.io/r/base/order.html) 'data.table' has two special ordering functions [`setorder()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) and [`setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html) which are more memory efficient. Both functions can be easily applied when we want to order by columns in increasing or decreasing order. However, when using expressions other than column names, workarounds are needed to use the full potential of 'data.table' `setorder` functions.

## dplyr

'dplyr' is known to be a "consistent grammar of data manipulation". It comes with several so called one-table verbs, which cover the most basic data operations - and ordering rows is one of them.

To order rows of a `tibble` or `data.frame` we use [`dplyr::arrange()`](https://dplyr.tidyverse.org/reference/arrange.html). The first argument is the `data.frame` we want to order, and the second argument is the ellipsis `...` allowing us to provide one or several expressions to order by.

As default [`dplyr::arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) orders columns in ascending order. To reverse this, we can wrap column names in [`dplyr::desc()`](https://dplyr.tidyverse.org/reference/desc.html). `NA` are always sorted last, and there is no argument to change this behavior. Finally, [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) is one of the few one-table verbs that ignores groupings of a `data.frame`, but this behavior can be changed (see info box below).

<div class="info-box" title="Arranging grouped data">

Although somewhat counterintuitive [`dplyr::arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) does ignore (but preserve) groupings of a `data.frame`:

<div class="highlight">

</div>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars_tbl</span> <span class='o'>%&gt;%</span> </span>
<span>  <span class='nf'>group_by</span><span class='o'>(</span><span class='nv'>cyl</span><span class='o'>)</span> <span class='o'>%&gt;%</span> </span>
<span>  <span class='nf'>arrange</span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 12 × 6</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Groups:   cyl [3]</span></span></span>
<span><span class='c'>#&gt;    model                cyl    vs  gear   mpg  disp</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>              <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> Duster 360             8     0     3  14.3  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> Valiant                6     1     3  18.1  225 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> Hornet Sportabout      8     0     3  18.7  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> Merc 280               6     1     4  19.2  168.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> Mazda RX4              6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> Mazda RX4 Wag          6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> Hornet 4 Drive         6     1     3  21.4  258 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> Datsun 710             4     1     4  22.8  108 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> Merc 230               4     1     4  22.8  141.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> Merc 240D              4     1     4  24.4  147.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> Cadillac Fleetwood     8     0     3  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> Honda Civic            4     1     4  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span></span></span>
<span></span></code></pre>

</div>

Here we'd probably expected the data to be sorted by `mpg` in ascending order within each group of `cyl`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars_tbl</span> <span class='o'>%&gt;%</span>  </span>
<span>  <span class='nf'>arrange</span><span class='o'>(</span><span class='nv'>cyl</span>, <span class='nv'>mpg</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 12 × 6</span></span></span>
<span><span class='c'>#&gt;    model                cyl    vs  gear   mpg  disp</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>              <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> Datsun 710             4     1     4  22.8  108 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> Merc 230               4     1     4  22.8  141.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> Merc 240D              4     1     4  24.4  147.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> Honda Civic            4     1     4  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> Valiant                6     1     3  18.1  225 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> Merc 280               6     1     4  19.2  168.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> Mazda RX4              6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> Mazda RX4 Wag          6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> Hornet 4 Drive         6     1     3  21.4  258 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> Duster 360             8     0     3  14.3  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> Hornet Sportabout      8     0     3  18.7  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> Cadillac Fleetwood     8     0     3  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span></span></span>
<span></span></code></pre>

</div>

However, [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) has an argument `.by_group` which is set to `FALSE` as default. Changing this to `TRUE` will make `arrange` work in the way we expected it:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars_tbl</span> <span class='o'>%&gt;%</span> </span>
<span>  <span class='nf'>group_by</span><span class='o'>(</span><span class='nv'>cyl</span><span class='o'>)</span> <span class='o'>%&gt;%</span> </span>
<span>  <span class='nf'>arrange</span><span class='o'>(</span><span class='nv'>mpg</span>, .by_group <span class='o'>=</span> <span class='kc'>TRUE</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 12 × 6</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Groups:   cyl [3]</span></span></span>
<span><span class='c'>#&gt;    model                cyl    vs  gear   mpg  disp</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>              <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> Datsun 710             4     1     4  22.8  108 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> Merc 230               4     1     4  22.8  141.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> Merc 240D              4     1     4  24.4  147.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> Honda Civic            4     1     4  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> Valiant                6     1     3  18.1  225 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> Merc 280               6     1     4  19.2  168.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> Mazda RX4              6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> Mazda RX4 Wag          6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> Hornet 4 Drive         6     1     3  21.4  258 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> Duster 360             8     0     3  14.3  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> Hornet Sportabout      8     0     3  18.7  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> Cadillac Fleetwood     8     0     3  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span></span></span>
<span></span></code></pre>

</div>

</div>

The following code chunks use a `tibble` version of our data:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://dplyr.tidyverse.org'>dplyr</a></span><span class='o'>)</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://purrr.tidyverse.org/'>purrr</a></span><span class='o'>)</span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tibble.tidyverse.org/reference/as_tibble.html'>as_tibble</a></span><span class='o'>(</span><span class='nv'>mycars</span><span class='o'>)</span></span></code></pre>

</div>

Similar to 'data.table', 'dplyr' uses non-standard evaluation, which is why we can use bare column names inside [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) without referring to our `data.frame` with `mycars_tbl$`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 1. Ordering by one or several variables</span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/desc.html'>desc</a></span><span class='o'>(</span><span class='nv'>cyl</span><span class='o'>)</span>, <span class='nv'>mpg</span><span class='o'>)</span></span></code></pre>

</div>

Since [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) accepts not only bare column names, but any arbitrary expressions we can easily rewrite the examples 2. to 4. as follows:

(Note that the code chunks below show only the ordering operation without assignment. To actually transform the data object we would need to assign the calls above to a new, or the same, object name.)

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 2. Ordering by a character vector with matching names</span></span>
<span><span class='nv'>my_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Hornet Sportabout"</span>, <span class='s'>"Cadillac Fleetwood"</span>, <span class='s'>"Valiant"</span>,</span>
<span>             <span class='s'>"Hornet 4 Drive"</span>, <span class='s'>"Mazda RX4"</span>, <span class='s'>"Mazda RX4 Wag"</span>, <span class='s'>"Honda Civic"</span>,</span>
<span>             <span class='s'>"Datsun 710"</span>, <span class='s'>"Duster 360"</span>, <span class='s'>"Merc 240D"</span>, <span class='s'>"Merc 230"</span>, <span class='s'>"Merc 280"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/factor.html'>factor</a></span><span class='o'>(</span><span class='nv'>model</span>, levels <span class='o'>=</span> <span class='nv'>my_vec</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># 3. Ordering by a simple expression</span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nv'>model</span> <span class='o'>!=</span> <span class='s'>"Hornet Sportabout"</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># 4. Ordering by a complex expression (positive numeric column)</span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nv'>vs</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='nf'><a href='https://dplyr.tidyverse.org/reference/desc.html'>desc</a></span><span class='o'>(</span><span class='nv'>mpg</span><span class='o'>)</span>, <span class='nv'>mpg</span><span class='o'>)</span><span class='o'>)</span></span></code></pre>

</div>

Similarly to what we have seen in base R and 'data.table', the case of ordering by a complex `ifelse` condition which is applied to a character column (or a numeric column that contains positive and negative values) is also in 'dplyr' a bit trickier.

Just using [`desc()`](https://dplyr.tidyverse.org/reference/desc.html) on one part of the `ifelse` condition will not yield the desired result:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nv'>vs</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='nf'><a href='https://dplyr.tidyverse.org/reference/desc.html'>desc</a></span><span class='o'>(</span><span class='nv'>model</span><span class='o'>)</span>, <span class='nv'>model</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 12 × 6</span></span></span>
<span><span class='c'>#&gt;    model                cyl    vs  gear   mpg  disp</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>              <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> Cadillac Fleetwood     8     0     3  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> Duster 360             8     0     3  14.3  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> Hornet Sportabout      8     0     3  18.7  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> Mazda RX4              6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> Mazda RX4 Wag          6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> Merc 240D              4     1     4  24.4  147.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> Merc 280               6     1     4  19.2  168.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> Valiant                6     1     3  18.1  225 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> Datsun 710             4     1     4  22.8  108 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> Honda Civic            4     1     4  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> Hornet 4 Drive         6     1     3  21.4  258 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> Merc 230               4     1     4  22.8  141.</span></span>
<span></span></code></pre>

</div>

The reason for this is that under the hood [`desc()`](https://dplyr.tidyverse.org/reference/desc.html) is a wrapper of `-xtfrm()` which is why the `ifelse` statement will coerce the result of the later with our original vector:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>mycars_tbl</span><span class='o'>$</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='nf'><a href='https://dplyr.tidyverse.org/reference/desc.html'>desc</a></span><span class='o'>(</span><span class='nv'>mycars_tbl</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span>, <span class='nv'>mycars_tbl</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span></span>
<span><span class='c'>#&gt;  [1] "Mazda RX4"          "Mazda RX4 Wag"      "-2"                </span></span>
<span><span class='c'>#&gt;  [4] "-5"                 "Hornet Sportabout"  "-12"               </span></span>
<span><span class='c'>#&gt;  [7] "Duster 360"         "-10"                "-9"                </span></span>
<span><span class='c'>#&gt; [10] "-11"                "Cadillac Fleetwood" "-4"</span></span>
<span></span></code></pre>

</div>

We can either wrap `model` in [`xtfrm()`](https://rdrr.io/r/base/xtfrm.html) or, for readability, we can create a helper function which just wraps [`xtfrm()`](https://rdrr.io/r/base/xtfrm.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># helper function for readability</span></span>
<span><span class='nv'>asc</span> <span class='o'>&lt;-</span> <span class='kr'>function</span><span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span> <span class='nf'><a href='https://rdrr.io/r/base/xtfrm.html'>xtfrm</a></span><span class='o'>(</span><span class='nv'>x</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nv'>vs</span>, <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>vs</span> <span class='o'>==</span> <span class='m'>1</span>, <span class='nf'><a href='https://dplyr.tidyverse.org/reference/desc.html'>desc</a></span><span class='o'>(</span><span class='nv'>model</span><span class='o'>)</span>, <span class='nf'>asc</span><span class='o'>(</span><span class='nv'>model</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 12 × 6</span></span></span>
<span><span class='c'>#&gt;    model                cyl    vs  gear   mpg  disp</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>              <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> Cadillac Fleetwood     8     0     3  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> Duster 360             8     0     3  14.3  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> Hornet Sportabout      8     0     3  18.7  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> Mazda RX4              6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> Mazda RX4 Wag          6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> Valiant                6     1     3  18.1  225 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> Merc 280               6     1     4  19.2  168.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> Merc 240D              4     1     4  24.4  147.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> Merc 230               4     1     4  22.8  141.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> Hornet 4 Drive         6     1     3  21.4  258 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> Honda Civic            4     1     4  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> Datsun 710             4     1     4  22.8  108</span></span>
<span></span></code></pre>

</div>

When programmatically ordering rows with 'dplyr' we can use [`across()`](https://dplyr.tidyverse.org/reference/across.html) inside [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html). [`across()`](https://dplyr.tidyverse.org/reference/across.html) lets us use either tidy-select syntax to select one or several columns. For example when we want to order by all columns except `model`, we can use `across(!model)` inside [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 5. Ordering by all columns of a data.frame</span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/across.html'>across</a></span><span class='o'>(</span><span class='o'>!</span><span class='nv'>model</span><span class='o'>)</span><span class='o'>)</span></span></code></pre>

</div>

Another option that [`across()`](https://dplyr.tidyverse.org/reference/across.html) offers is to use tidy-select helper functions, like [`all_of()`](https://tidyselect.r-lib.org/reference/all_of.html), which allows us to pass a character vector of column names to order by:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 6. Ordering by a list or vector of column names</span></span>
<span><span class='nv'>mycols</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"mpg"</span>, <span class='s'>"cyl"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/across.html'>across</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>all_of</a></span><span class='o'>(</span><span class='nv'>mycols</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span></code></pre>

</div>

The usability of working programmatically with [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) stops with the option to provide a character vector of column names. When we further want to specify which columns should be sorted in ascending or descending order, things get a little bit more complicated.

In this case we should first construct a named vector, below `arg_vec`, containing `TRUE` or `FALSE` for "descending" or not. It should be named after the column names we want to order by. We can then use this vector in an anonymous function in which we subset it with [`dplyr::cur_column()`](https://dplyr.tidyverse.org/reference/context.html) in an `if` clause saying: if `TRUE` then use your current column values in descending order `desc(.x)` or else just use the current column values as they are `.x`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 6. Ordering by vectors of column names and descending argument</span></span>
<span><span class='nv'>desc_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='kc'>TRUE</span>, <span class='kc'>FALSE</span><span class='o'>)</span></span>
<span><span class='nv'>arg_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/set_names.html'>set_names</a></span><span class='o'>(</span><span class='nv'>desc_vec</span>, <span class='nv'>mycols</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/across.html'>across</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>all_of</a></span><span class='o'>(</span><span class='nv'>mycols</span><span class='o'>)</span>,</span>
<span>                 <span class='o'>~</span> <span class='kr'>if</span> <span class='o'>(</span><span class='nv'>arg_vec</span><span class='o'>[</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/context.html'>cur_column</a></span><span class='o'>(</span><span class='o'>)</span><span class='o'>]</span><span class='o'>)</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/desc.html'>desc</a></span><span class='o'>(</span><span class='nv'>.x</span><span class='o'>)</span> <span class='kr'>else</span> <span class='nv'>.x</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 12 × 6</span></span></span>
<span><span class='c'>#&gt;    model                cyl    vs  gear   mpg  disp</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>              <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> Merc 240D              4     1     4  24.4  147.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> Datsun 710             4     1     4  22.8  108 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> Merc 230               4     1     4  22.8  141.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> Hornet 4 Drive         6     1     3  21.4  258 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> Mazda RX4              6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> Mazda RX4 Wag          6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> Merc 280               6     1     4  19.2  168.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> Hornet Sportabout      8     0     3  18.7  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> Valiant                6     1     3  18.1  225 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> Duster 360             8     0     3  14.3  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> Honda Civic            4     1     4  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> Cadillac Fleetwood     8     0     3  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span></span></span>
<span></span></code></pre>

</div>

Finally, the last example of ordering by a vector of matching patterns, is actually easier to tackle than it looks like.

'dplyr' offers us two ways of doing this.

1․ Pack all the magic in one pipe:<br> We can take our base R approach with [`lapply()`](https://rdrr.io/r/base/lapply.html) and [`grepl()`](https://rdrr.io/r/base/grep.html) use [`purrr::map()`](https://purrr.tidyverse.org/reference/map.html) with a lambda function `~` instead and pipe the result into [`dplyr::bind_cols()`](https://dplyr.tidyverse.org/reference/bind_cols.html). This last part is needed, since [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) accepts `data.frame`s in the ellipsis argument, but not a `list`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 7. Ordering by a vector of matching patterns</span></span>
<span><span class='nv'>my_pattern</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"Mazda"</span>, <span class='s'>"Merc"</span>, <span class='s'>"Hornet"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://purrr.tidyverse.org/reference/map.html'>map</a></span><span class='o'>(</span><span class='nv'>my_pattern</span>,</span>
<span>        <span class='o'>~</span> <span class='o'>!</span><span class='nf'><a href='https://rdrr.io/r/base/grep.html'>grepl</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"^"</span>, <span class='nv'>.x</span><span class='o'>)</span>, <span class='nv'>model</span><span class='o'>)</span></span>
<span>        <span class='o'>)</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/bind_cols.html'>bind_cols</a></span><span class='o'>(</span><span class='o'>)</span></span>
<span>    <span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 12 × 6</span></span></span>
<span><span class='c'>#&gt;    model                cyl    vs  gear   mpg  disp</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>              <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> Mazda RX4              6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> Mazda RX4 Wag          6     0     4  21    160 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> Merc 240D              4     1     4  24.4  147.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> Merc 230               4     1     4  22.8  141.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> Merc 280               6     1     4  19.2  168.</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> Hornet 4 Drive         6     1     3  21.4  258 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> Hornet Sportabout      8     0     3  18.7  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> Datsun 710             4     1     4  22.8  108 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> Valiant                6     1     3  18.1  225 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> Duster 360             8     0     3  14.3  360 </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> Cadillac Fleetwood     8     0     3  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span> </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> Honda Civic            4     1     4  <span style='color: #BB0000;'>NA</span>     <span style='color: #BB0000;'>NA</span></span></span>
<span></span></code></pre>

</div>

2․ Create an index list and splice it into arrange:<br> Alternatively we can proceed in two steps. First create an index list, similar to our base R approach. Then, instead of using `do.call` we can splice the list as arguments to [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) using the triple bang operator `!!!`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># 7. Ordering by a vector of matching patterns</span></span>
<span><span class='nv'>idx_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://purrr.tidyverse.org/reference/map.html'>map</a></span><span class='o'>(</span><span class='nv'>my_pattern</span>,</span>
<span>              <span class='o'>~</span> <span class='o'>!</span><span class='nf'><a href='https://rdrr.io/r/base/grep.html'>grepl</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/paste.html'>paste0</a></span><span class='o'>(</span><span class='s'>"^"</span>, <span class='nv'>.x</span><span class='o'>)</span>, <span class='nv'>mycars_tbl</span><span class='o'>$</span><span class='nv'>model</span><span class='o'>)</span></span>
<span>              <span class='o'>)</span></span>
<span> </span>
<span><span class='nv'>mycars_tbl</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span> </span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='o'>!</span><span class='o'>!</span><span class='o'>!</span> <span class='nv'>idx_ls</span><span class='o'>)</span></span>
<span><span class='c'># same result as above</span></span></code></pre>

</div>

#### Summing up: Ordering rows with 'dplyr'

The examples above show that 'dplyr' offers a very intuitive API for ordering rows. In most cases a call to `arrange` is enough to get our desired result. When ordering rows programmatically, 'dplyr' has us covered with [`across()`](https://dplyr.tidyverse.org/reference/across.html) and 'tidyselect' helper functions, like [`all_of()`](https://tidyselect.r-lib.org/reference/all_of.html), which can be used inside `arrange`. 'dplyr' feels definitely more beginner-friendly than base R, since [`arrange()`](https://dplyr.tidyverse.org/reference/arrange.html) covers more common use cases, and [`across()`](https://dplyr.tidyverse.org/reference/across.html) seems to have less conceptional overhead compared to base's `do.call`. However, this holds true only up to a certain grade of complexity. For the more advanced examples splicing `!!!` and subsetting with `cur_colum()` were needed, which do not differ much in terms of conceptional overhead.

## pandas

To conclude this post, let's look at how python's 'pandas' library tackles our seven ordering challenges. First, lets import 'pandas' and read in the data:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'>import pandas as pd
mycars = pd.read_csv("mycars.csv", index_col = 0)
</code></pre>

</div>

There are several ways of reordering rows in a pandas `DataFrame`. Here we will focus on the <a href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.sort_values.html">`sort_values()`</a> method for `DataFrame` objects.

`sort_values()` can work in both directions, ordering rows or, alternatively, ordering columns. With our examples from above in mind, we will only look at ordering rows, leaving the `axis` argument in its default value `0`.

With this default setting, `sort_values()` takes a column name or list of column names to sort `by`. We can further specify for each column whether its values should be sorted in ascending or descending order by passing a list of `True` and `False` values to the `ascending` argument.

With only those two arguments, `by` and `ascending`, we can easily handle the examples 1., 5. and 6., where we just need to specify column names and their order:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'># 1. sort one or several columns in ascending or descending order
mycars.sort_values(by='mpg')

(mycars.
 sort_values(by=['cyl', 'mpg'],
             ascending=[False, True])
)

# 5. order by all columns of a df

(mycars.
 sort_values(by = list(mycars.columns)[1:])
)

# 6. order by list of string column names

my_cols = ['mpg', 'disp']
my_order = [False, True]
 
(mycars.
 sort_values(by = my_cols,
             ascending = my_order)
)
</code></pre>

</div>

Things get more complicated when we want to order by an expression which is not a column name. In our second example we want to order by a list of matching string names, ideally without transforming the data itself.

Here we can use `sort_values()` `key` argument. `key` takes a function and applies it to all columns specified in `by` before ordering. The idea is to order `by` the `model` column, and apply a `lambda` function to it, that first turns it into a categorical variable and then sets our list of matching names `cat_ls` as new categories before ordering. Like in R, 'pandas' sorts categorical variables according to the order of their categories (in R: `levels`).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'># 2. order by list of strings with matching names
cat_ls = ["Hornet Sportabout", "Cadillac Fleetwood", "Valiant",
          "Hornet 4 Drive", "Mazda RX4", "Mazda RX4 Wag", "Honda Civic",
          "Datsun 710", "Duster 360", "Merc 240D", "Merc 230", "Merc 280"]
 
(mycars.
 sort_values(by='model',
             key=lambda x: x
             .astype('category').cat.set_categories(cat_ls)
             )
)

#>                  model  cyl  vs  gear   mpg   disp
#> 5    Hornet Sportabout    8   0     3  18.7  360.0
#> 11  Cadillac Fleetwood    8   0     3   NaN    NaN
#> 6              Valiant    6   1     3  18.1  225.0
#> 4       Hornet 4 Drive    6   1     3  21.4  258.0
#> 1            Mazda RX4    6   0     4  21.0  160.0
#> 2        Mazda RX4 Wag    6   0     4  21.0  160.0
#> 12         Honda Civic    4   1     4   NaN    NaN
#> 3           Datsun 710    4   1     4  22.8  108.0
#> 7           Duster 360    8   0     3  14.3  360.0
#> 8            Merc 240D    4   1     4  24.4  146.7
#> 9             Merc 230    4   1     4  22.8  140.8
#> 10            Merc 280    6   1     4  19.2  167.6
</code></pre>

</div>

A different way of tackling this problem is to set the `model` column as index (similar to `rownames` in R). Then `reindex` the data with our list of matching names, `cat_ls`, and finally resetting the index, so that `model` becomes a regular column again.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'># 2. order by list of strings with matching names
(mycars.
 set_index('model').
 reindex(cat_ls).
 reset_index()
)
# output as above
</code></pre>

</div>

This is probably the 'pandas' way to go about this problem, but it is important that we know about the `key` argument and how to use it. If an expression is related to values of a column, like in example no. 3, where we want to sort one value to the top, applying a simple `lambda` function is probably the easiest approach.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'># 3. order by a simple logical expression
(mycars.
 sort_values(by='model',
             key=lambda x: x != "Hornet Sportabout"
             )
)

#>                  model  cyl  vs  gear   mpg   disp
#> 5    Hornet Sportabout    8   0     3  18.7  360.0
#> 1            Mazda RX4    6   0     4  21.0  160.0
#> 2        Mazda RX4 Wag    6   0     4  21.0  160.0
#> 3           Datsun 710    4   1     4  22.8  108.0
#> 4       Hornet 4 Drive    6   1     3  21.4  258.0
#> 6              Valiant    6   1     3  18.1  225.0
#> 7           Duster 360    8   0     3  14.3  360.0
#> 8            Merc 240D    4   1     4  24.4  146.7
#> 9             Merc 230    4   1     4  22.8  140.8
#> 10            Merc 280    6   1     4  19.2  167.6
#> 11  Cadillac Fleetwood    8   0     3   NaN    NaN
#> 12         Honda Civic    4   1     4   NaN    NaN
</code></pre>

</div>

Also example no. 7, ordering by a list of matching patterns, can be solved by using the `key` argument. However, this case is quite complex.

Apart from the pattern we want to sort by, `my_pattern`, we need a dictionary to bring the patterns into an order, `custom_dict`. We then order `by` `model`, use the string `replace` method to replace the full model name with the name of the pattern, and finally `map` this transformed column over our custom dictionary. All values which are not matched by the dictionary are `NaN` and are automatically sorted last.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'># 7. order by a list of matching patterns
my_pattern = ["Mazda", "Merc", "Hornet"]
 
custom_dict = {k: v for v, k in enumerate(my_pattern)}
 
(mycars.
 sort_values(by='model',
             key=lambda x: x
             .str.replace('^('+'|'.join(my_pattern)+').*',
                          r"\1",
                          regex = True)
             .map(custom_dict)
             )
)

#>                  model  cyl  vs  gear   mpg   disp
#> 1            Mazda RX4    6   0     4  21.0  160.0
#> 2        Mazda RX4 Wag    6   0     4  21.0  160.0
#> 8            Merc 240D    4   1     4  24.4  146.7
#> 9             Merc 230    4   1     4  22.8  140.8
#> 10            Merc 280    6   1     4  19.2  167.6
#> 4       Hornet 4 Drive    6   1     3  21.4  258.0
#> 5    Hornet Sportabout    8   0     3  18.7  360.0
#> 3           Datsun 710    4   1     4  22.8  108.0
#> 6              Valiant    6   1     3  18.1  225.0
#> 7           Duster 360    8   0     3  14.3  360.0
#> 11  Cadillac Fleetwood    8   0     3   NaN    NaN
#> 12         Honda Civic    4   1     4   NaN    NaN
</code></pre>

</div>

Finally, the most troublesome challenge in 'pandas' is no. 4: ordering by a complex expression. In this example we wanted to sort the model names in descending order when the engine is v-shaped, `vs == 0`, and in ascending order if it's normally shaped, `vs == 1`.

Inspired by this <a href="https://stackoverflow.com/a/71189275/9349302" role="highlight">answer</a> on StackOverflow, the idea is to first create an empty output `DataFrame`, below `mycars2`. We then loop over `mycars` grouped by `vs` and create a `True` or `False` variable, `orderg`, that checks if the group name `grp_name` is `0` or not. We then sort each group `by='model'` and pass the `orderg` flag to the `ascending` argument before appending the data to our output object. Finally, we `drop` and reset the index of `mycars2` to restore the format of our inital data:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'># 4. order by a complex expression
mycars2 = pd.DataFrame(data=None, columns=mycars.columns)

for grp_name, grp_dat in mycars.groupby(['vs']):
    orderg = (grp_name==0) # ascending order if vs == 0
    mycars2 = pd.concat([mycars2,
                         grp_dat.
                          reset_index().
                          sort_values(by='model', ascending=orderg)]
                        )
 
# final tweaks        
mycars2 = (mycars2.
 drop('index', axis=1).
 reset_index(drop=True)
)
mycars2

#>                  model cyl vs gear   mpg   disp
#> 0   Cadillac Fleetwood   8  0    3   NaN    NaN
#> 1           Duster 360   8  0    3  14.3  360.0
#> 2    Hornet Sportabout   8  0    3  18.7  360.0
#> 3            Mazda RX4   6  0    4  21.0  160.0
#> 4        Mazda RX4 Wag   6  0    4  21.0  160.0
#> 5              Valiant   6  1    3  18.1  225.0
#> 6             Merc 280   6  1    4  19.2  167.6
#> 7            Merc 240D   4  1    4  24.4  146.7
#> 8             Merc 230   4  1    4  22.8  140.8
#> 9       Hornet 4 Drive   6  1    3  21.4  258.0
#> 10         Honda Civic   4  1    4   NaN    NaN
#> 11          Datsun 710   4  1    4  22.8  108.0
</code></pre>

</div>

#### Summing up: Ordering rows with 'pandas':

'pandas' `sort_values()` method has a strong programmatic interface similar to [`data.table::setorderv()`](https://Rdatatable.gitlab.io/data.table/reference/setorder.html). This makes it easy to work with, when we have a lists of column names and Boolean values to specify the sorting direction. Ordering by expressions other than column names seems to be more effort in 'pandas' compared to R. As long as the expressions can be derived from column values, `sort_values()` `key` argument can help us tackle most of the ordering challenges. However, once the expression we want to order by is not directly related to a specific column, we have to fall back to a classic `for` loop, which feels somewhat clunky compared to what we have seen in R.

## Wrap-up

This post turned out to be almost a book chapter on ordering rows. I hope you enjoyed it. If you have a better approach to one of the examples above or if you have a special ordering challenge that I haven't considered, let me know via Twitter, Mastodon or Github.

<div class="session" markdown="1">

<details class="sess">
<summary class="session-header">
Session Info <i class="fas fa-tools"></i>
</summary>

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Session info ───────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>setting </span> <span style='color: #555555; font-style: italic;'>value</span></span></span>
<span><span class='c'>#&gt;  version  R version 4.2.1 (2022-06-23)</span></span>
<span><span class='c'>#&gt;  os       macOS Big Sur ... 10.16</span></span>
<span><span class='c'>#&gt;  system   x86_64, darwin17.0</span></span>
<span><span class='c'>#&gt;  ui       X11</span></span>
<span><span class='c'>#&gt;  language (EN)</span></span>
<span><span class='c'>#&gt;  collate  en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  ctype    en_US.UTF-8</span></span>
<span><span class='c'>#&gt;  tz       Europe/Berlin</span></span>
<span><span class='c'>#&gt;  date     2023-02-05</span></span>
<span><span class='c'>#&gt;  pandoc   2.19.2 @ /Applications/RStudio.app/Contents/MacOS/quarto/bin/tools/ (via rmarkdown)</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Packages ───────────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>package   </span> <span style='color: #555555; font-style: italic;'>*</span> <span style='color: #555555; font-style: italic;'>version</span> <span style='color: #555555; font-style: italic;'>date (UTC)</span> <span style='color: #555555; font-style: italic;'>lib</span> <span style='color: #555555; font-style: italic;'>source</span></span></span>
<span><span class='c'>#&gt;  data.table * 1.14.2  <span style='color: #555555;'>2021-09-27</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  dplyr      * 1.1.0   <span style='color: #555555;'>2023-01-29</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  purrr      * 1.0.1   <span style='color: #555555;'>2023-01-10</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  reticulate * 1.26    <span style='color: #555555;'>2022-08-31</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> [1] /Library/Frameworks/R.framework/Versions/4.2/Resources/library</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Python configuration ───────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  python:         /usr/local/Caskroom/miniconda/base/bin/python3.9</span></span>
<span><span class='c'>#&gt;  libpython:      /usr/local/Caskroom/miniconda/base/lib/libpython3.9.dylib</span></span>
<span><span class='c'>#&gt;  pythonhome:     /usr/local/Caskroom/miniconda/base:/usr/local/Caskroom/miniconda/base</span></span>
<span><span class='c'>#&gt;  version:        3.9.12 (main, Apr  5 2022, 01:53:17)  [Clang 12.0.0 ]</span></span>
<span><span class='c'>#&gt;  numpy:          /usr/local/Caskroom/miniconda/base/lib/python3.9/site-packages/numpy</span></span>
<span><span class='c'>#&gt;  numpy_version:  1.22.3</span></span>
<span><span class='c'>#&gt;  </span></span>
<span><span class='c'>#&gt;  NOTE: Python version was forced by RETICULATE_PYTHON</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>──────────────────────────────────────────────────────────────────────────────</span></span></span>
<span></span></code></pre>

</div>

</details>

</div>

<script>
  function create_info_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("note-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-info-circle");
    summary.append(summary_title, summary_icon);

    let div_note_details = document.createElement("div");
    div_note_details.classList.add('note-details');
    div_note_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_note_details);

    let div_note = document.createElement("div");
    div_note.classList.add('note');
    div_note.setAttribute("markdown", "1");
    div_note.append(details);
    return(div_note)
  };

  function create_warn_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("warn-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-exclamation-circle");
    summary.append(summary_title, summary_icon);

    let div_warn_details = document.createElement("div");
    div_warn_details.classList.add('warn-details');
    div_warn_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_warn_details);

    let div_warn = document.createElement("div");
    div_warn.classList.add('warn');
    div_warn.setAttribute("markdown", "1");
    div_warn.append(details);
    return(div_warn)
  };

  function info_box() {
    let childs = document.querySelectorAll("div.info-box");
    childs.forEach(el => {
      let title = el.title
      let info_box = create_info_box(title, el.childNodes);
      el.append(info_box)
    });
  };

  function warn_box() {
    let childs = document.querySelectorAll("div.warn-box");
    childs.forEach(el => {
      let title = el.title
      let warn_box = create_warn_box(title, el.childNodes);
      el.append(warn_box)
    });
  };

  window.onload = info_box();
  window.onload = warn_box();
</script>

