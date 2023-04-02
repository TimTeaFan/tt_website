---
output:
  hugodownplus::md_document:
    use_boxes: TRUE
    toc: TRUE
# Documentation: https://sourcethemes.com/academic/docs/managing-content/

title: "Mastering the Many Models Approach"
subtitle: "A Comprehensive Guide to the Tidyverse Many Models Approach and its Extensions"
summary: "This blog post reviews the basic many models approach, updates it using the current tidyverse syntax, and  expands upon the original approach by introducing new building blocks and helper functions."
authors: []
tags: ["R", "dplyr", "base R"]
categories: ["R", "dplyr", "base R"]
date: 2023-03-31
lastmod: 2023-03-31
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
rmd_hash: a95f94aa3ec1f214

---

-   <a href="#intro" id="toc-intro">Intro</a>
-   <a href="#setup" id="toc-setup">Setup</a>
-   <a href="#fundamentals" id="toc-fundamentals">Fundamentals</a>
-   <a href="#extensions" id="toc-extensions">Extensions</a>
-   <a href="#endgame" id="toc-endgame">Endgame</a>
-   <a href="#wrap-up" id="toc-wrap-up">Wrap-up</a>

## Intro

The tidyverse "many models" approach was formally introduced in the first edition of <a href="https://r4ds.had.co.nz/many-models.html" role="highlight" target="_blank">R for Data Science</a> (R4DS) in 2017. Since then, the tidyverse has evolved significantly, and along with it, the way we can harness the many models approach. This blog post aims to i) review the basic approach and update it using the latest tidyverse syntax, and ii) explore a range of use cases with increasing complexity while introducing new building blocks and helper functions.

The structure of this blog post also reflects my motivation for writing it. I think that this is a powerful approach that should be more widely known. Those who are actually using it, often rely on an older syntax, which makes things more complicated than necessary. In addition to the original building blocks, there are several lesser-known functions that help apply this approach to more complex use cases.

Lately, the tidyverse many models approach hasn't received much attention. One might expect this to change with the coming release of the <a href="http://r4ds.hadley.nz" role="highlight" target="_blank">second edition of R4DS</a>. However, the entire section on modeling has been omitted from this release. According to the authors, the reasons for this are twofold: First, there was never ample room to address the whole topic of modeling within R4DS. Second, the authors recommend the 'tidymodels' packages, which are well documented in <a href="https://www.tmwr.org" role="highlight" target="_blank">Tidy Modeling with R</a> which is filling the gap.

While 'tidymodels' is a strong framework with definite advantages when working with various algorithms and model engines, it comes with considerable conceptual and syntactic overhead. For this reason, I believe there is still a lot of room (and use cases) for the "classic" tidyverse many models approach, which is based on 'dplyr' syntax but utilizes base R, or alternatively package-specific, models.

But before we delve into the use cases, let's begin with the setup.

## Setup

Unlike the name suggests, we don't need all of the 'tidyverse' packages for the tidyverse many models approach. The heavy lifting is done by 'dplyr' and 'tidyr'. Additionally, we use 'rlang' and 'purrr' for some extra functionality. In this post we'll be using the `csat` and `csatraw` data from my own package 'dplyover'.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://dplyr.tidyverse.org'>dplyr</a></span><span class='o'>)</span>        <span class='c'># &lt;- necessary</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://tidyr.tidyverse.org'>tidyr</a></span><span class='o'>)</span>        <span class='c'># &lt;- necessary</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://broom.tidymodels.org/'>broom</a></span><span class='o'>)</span>        <span class='c'># &lt;- necessary</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://rlang.r-lib.org'>rlang</a></span><span class='o'>)</span>        <span class='c'># &lt;- nice to have</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://vincentarelbundock.github.io/modelsummary/'>modelsummary</a></span><span class='o'>)</span> <span class='c'># &lt;- for output</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://purrr.tidyverse.org/'>purrr</a></span><span class='o'>)</span>        <span class='c'># &lt;- not really needed</span></span>
<span><span class='kr'><a href='https://rdrr.io/r/base/library.html'>library</a></span><span class='o'>(</span><span class='nv'><a href='https://github.com/TimTeaFan/dplyover'>dplyover</a></span><span class='o'>)</span>     <span class='c'># &lt;- only for the data</span></span></code></pre>

</div>

`csat` is a mock-up dataset resembling data from a customer survey. It comes in two forms: the labeled data, `csat`, with meaningful column names and factor levels, and the corresponding raw data, `csataw`, where each column is a survey item and responses are just numbers. Since our models will be using the numbers instead of the factor levels, we'll use the data from `csatraw`, but rename the columns according to `csat` (see my <a href="../2022-rename-columns/" role="highlight" target="_blank">earlier post</a> on how to rename variables). Additionally, we'll drop variables that we don't need. Let's take a `glimpse` at the resulting dataset `csat_named`:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># create a look-up vector of old and new names</span></span>
<span><span class='nv'>lookup_vec</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/set_names.html'>set_names</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>csatraw</span><span class='o'>)</span>, <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>csat</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='c'># rename the columns</span></span>
<span><span class='nv'>csat_named</span> <span class='o'>&lt;-</span> <span class='nv'>csatraw</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rename.html'>rename</a></span><span class='o'>(</span><span class='nf'><a href='https://tidyselect.r-lib.org/reference/all_of.html'>any_of</a></span><span class='o'>(</span><span class='nv'>lookup_vec</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>cust_id</span>, <span class='nv'>type</span>, <span class='nv'>product</span>, <span class='nv'>csat</span>,</span>
<span>         <span class='nf'><a href='https://tidyselect.r-lib.org/reference/starts_with.html'>ends_with</a></span><span class='o'>(</span><span class='s'>"rating"</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nf'><a href='https://pillar.r-lib.org/reference/glimpse.html'>glimpse</a></span><span class='o'>(</span><span class='nv'>csat_named</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; Rows: 150</span></span>
<span><span class='c'>#&gt; Columns: 9</span></span>
<span><span class='c'>#&gt; $ cust_id        <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> "61297", "07545", "03822", "88219", "31831", "63646", "…</span></span>
<span><span class='c'>#&gt; $ type           <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> "existing", "existing", "existing", "reactivate", "new"…</span></span>
<span><span class='c'>#&gt; $ product        <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span> "advanced", "advanced", "premium", "basic", "basic", "b…</span></span>
<span><span class='c'>#&gt; $ csat           <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 3, 2, 2, 4, 4, 3, 1, 3, 3, 2, 5, 4, 4, 1, 4, 4, 2, 3, 2…</span></span>
<span><span class='c'>#&gt; $ postal_rating  <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 3, 2, 5, 5, 2, NA, 3, 3, 4, NA, NA, 4, 3, 4, 1, 5, NA, …</span></span>
<span><span class='c'>#&gt; $ phone_rating   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 2, 4, 5, 3, 5, 3, 4, 2, NA, 2, NA, NA, 2, 4, NA, 2, 4, …</span></span>
<span><span class='c'>#&gt; $ email_rating   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> NA, 3, NA, NA, 5, 2, 3, 5, 3, 1, 3, 1, 3, 1, 3, 3, 4, 1…</span></span>
<span><span class='c'>#&gt; $ website_rating <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 5, 2, 3, 4, 1, 3, 3, 1, 3, 2, 4, 2, NA, 4, 1, 2, NA, 5,…</span></span>
<span><span class='c'>#&gt; $ shop_rating    <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> 3, 1, 2, 2, 5, 4, 4, 2, 2, 2, 4, 3, 2, NA, 3, 5, 4, 1, …</span></span>
<span></span></code></pre>

</div>

Every row is the response of a customer, `cust_id`, who owns a contract-base `product` available in different flavors: "basic", "advanced" or "premium". There are three different `type`s of customers: "existing", "new" and "reactivate". Our dependent variable is the customer satisfaction score, `csat`, which ranges from '1 = Very unsatisfied' to '5 = Very satisfied'. The independent variables are ratings on the same scale concerning the following touchpoints: "postal", "phone", "email", "website" and "shop". We've dropped all other variables, but interested readers can find both datasets well documented in the 'dplyover' package ([`?csat`](https://rdrr.io/pkg/dplyover/man/csat.html), [`?csatraw`](https://rdrr.io/pkg/dplyover/man/csatraw.html)).

## Fundamentals

Let's start with the basic approach as it was introduced in R4DS. Keep in mind that syntax and functions have evolved over the past five years, so we'll be refining the original ideas into a more canonical form. There are four essential components we'll be discussing:

1.  nested data
2.  rowwise operations
3.  tidy results
4.  unesting results

If you're already familiar with these concepts, feel free to skip this section.

#### Nested data

The central idea of the many-models approach is to streamline the process of running models on various subsets of data. Let's say we want to perform a linear regression on each product type. In a traditional base R approach, we might have used a `for` loop to populate a list object with the results of each run. However, the tidyverse method begins with a nested `data.frame`.

So, what is a nested data.frame? We can use `dplyr::nest_by(product)` to create a `data.frame` containing three rows, one for each product. The second column, `data`, is a 'list-column' that holds a list of `data.frame`'s---one for each row. These `data.frame`s contain data for all customers within the corresponding product category. If you're unfamiliar with list-columns, I highly recommend reading <a href="https://r4ds.had.co.nz/many-models.html" role="highlight" target="_blank">chapter 25 of R4DS</a>. Although some parts may be outdated, it remains an excellent resource for understanding the essential components of this approach.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_prod_nested</span> <span class='o'>&lt;-</span> <span class='nv'>csat_named</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/nest_by.html'>nest_by</a></span><span class='o'>(</span><span class='nv'>product</span><span class='o'>)</span> </span>
<span></span>
<span><span class='nv'>csat_prod_nested</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 3 × 2</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise:  product</span></span></span>
<span><span class='c'>#&gt;   product                data</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;list&lt;tibble[,8]&gt;&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> advanced           <span style='color: #555555;'>[40 × 8]</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> basic              <span style='color: #555555;'>[60 × 8]</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> premium            <span style='color: #555555;'>[50 × 8]</span></span></span>
<span></span></code></pre>

</div>

Looking at the first element (row) of the `data` column shows a `data.frame` with 40 customers, all of whom have "advanced" products. The `product` column is omitted, as this information is already included in our nested data: `csat_prod_nested`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_prod_nested</span><span class='o'>$</span><span class='nv'>data</span><span class='o'>[[</span><span class='m'>1</span><span class='o'>]</span><span class='o'>]</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 40 × 8</span></span></span>
<span><span class='c'>#&gt;    cust_id type        csat postal_rating phone_rating email_r…¹ websi…² shop_…³</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>      <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>        <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> 61297   existing       3             3            2        <span style='color: #BB0000;'>NA</span>       5       3</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> 07545   existing       2             2            4         3       2       1</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> 63600   existing       1             3            4         3       3       4</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> 82048   reactivate     3             3            2         5       1       2</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> 41142   reactivate     3             4           <span style='color: #BB0000;'>NA</span>         3       3       2</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> 06387   reactivate     1             4            4         1       4      <span style='color: #BB0000;'>NA</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> 63024   existing       2            <span style='color: #BB0000;'>NA</span>            4         4      <span style='color: #BB0000;'>NA</span>       4</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> 55743   new            1             4            5         4       1       5</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> 32689   new            5             3           <span style='color: #BB0000;'>NA</span>         3       4       2</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> 33603   existing       2             3            3         4       3       2</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 30 more rows, and abbreviated variable names ¹​email_rating,</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>#   ²​website_rating, ³​shop_rating</span></span></span>
<span></span></code></pre>

</div>

#### Rowwise operations

Applying [`nest_by()`](https://dplyr.tidyverse.org/reference/nest_by.html) also groups our data [`rowwise()`](https://dplyr.tidyverse.org/reference/rowwise.html). This means that subsequent dplyr operations will be applied "one row at a time." This is particularly helpful when vectorized functions aren't available, such as the [`lm()`](https://rdrr.io/r/stats/lm.html) function in our case, which we want to apply to the data in each row.

First, let's define the relationship between our dependent and independent variables using a formula object, `my_formula`.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>my_formula</span> <span class='o'>&lt;-</span> <span class='nv'>csat</span> <span class='o'>~</span> <span class='nv'>postal_rating</span> <span class='o'>+</span> <span class='nv'>phone_rating</span> <span class='o'>+</span> <span class='nv'>email_rating</span> <span class='o'>+</span></span>
<span>  <span class='nv'>website_rating</span> <span class='o'>+</span> <span class='nv'>shop_rating</span></span>
<span></span>
<span><span class='nv'>my_formula</span></span>
<span><span class='c'>#&gt; csat ~ postal_rating + phone_rating + email_rating + website_rating + </span></span>
<span><span class='c'>#&gt;     shop_rating</span></span>
<span></span></code></pre>

</div>

Next, we use `mutate` to create new columns. We'll start by creating a column called `mod` containing our model. We'll apply the [`lm()`](https://rdrr.io/r/stats/lm.html) function with the previously defined formula and supply the `data` column to it. Since we are working with a `rowwise` `data.frame`, the [`lm()`](https://rdrr.io/r/stats/lm.html) function is executed three times, one time for each row, each time using a different `data.frame` of the list-column `data`. As the result of each call is not an atomic vector but an `lm` object of type `list`, we need to wrap the function call in [`list()`](https://rdrr.io/r/base/list.html). This results in a new list-column, `mod`, which holds an `lm` object in each row.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_prod_nested</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>my_formula</span>, data <span class='o'>=</span> <span class='nv'>data</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 3 × 3</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise:  product</span></span></span>
<span><span class='c'>#&gt;   product                data mod   </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;list&lt;tibble[,8]&gt;&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> advanced           <span style='color: #555555;'>[40 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> basic              <span style='color: #555555;'>[60 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> premium            <span style='color: #555555;'>[50 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span></span></span>
<span></span></code></pre>

</div>

#### Tidy results with broom

To make the results of this model more accessible, we'll use two functions from the 'broom' package:

[`broom::glance()`](https://generics.r-lib.org/reference/glance.html) returns a `data.frame` containing all model statics, such as r-squared, BIC, AIC etc., and the overall p-value of the model itself.

[`broom::tidy()`](https://generics.r-lib.org/reference/tidy.html) returns a `data.frame` with all regression terms, their estimates, p-values and other statistics.

Again, we'll wrap both functions in [`list()`](https://rdrr.io/r/base/list.html) and call them on the model in the new `mod` column. This yields a final, nested `data.frame`. The rows represent the three product subgroups, while the columns contain the input `data`, the model `mod`, and the results `modstat` and `res`. Beside `mod`, each of these columns is a list of `data.frame`s:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_prod_nested_res</span> <span class='o'>&lt;-</span> <span class='nv'>csat_prod_nested</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod     <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>my_formula</span>, data <span class='o'>=</span> <span class='nv'>data</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         modstat <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/glance.html'>glance</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         res <span class='o'>=</span>     <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/tidy.html'>tidy</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>csat_prod_nested_res</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 3 × 5</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise:  product</span></span></span>
<span><span class='c'>#&gt;   product                data mod    modstat           res             </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;list&lt;tibble[,8]&gt;&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>            <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>          </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> advanced           <span style='color: #555555;'>[40 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span> <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> basic              <span style='color: #555555;'>[60 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span> <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> premium            <span style='color: #555555;'>[50 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span> <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span></span></span>
<span></span></code></pre>

</div>

#### Nesting results

With the groundwork laid, it is now easy to access the results. To do this, we'll use [`tidyr::unnest()`](https://tidyr.tidyverse.org/reference/nest.html) to convert a list of `data.frame`s back into a regular `data.frame`. First, lets look at the model statistics. We'll select the `product` and `modstat` columns and `unnest` the latter. This produces a `data.frame` with different model statistics for the three product subgroups. In this case, we're interested in the r-squared, the p-value and the number of observations of each model:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_prod_nested_res</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>product</span>, <span class='nv'>modstat</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/nest.html'>unnest</a></span><span class='o'>(</span><span class='nv'>modstat</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>r.squared</span>, <span class='nv'>p.value</span>, <span class='nv'>nobs</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; Adding missing grouping variables: `product`</span></span>
<span></span><span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 3 × 4</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Groups:   product [3]</span></span></span>
<span><span class='c'>#&gt;   product  r.squared p.value  nobs</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>        <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> advanced     0.112   0.941    15</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> basic        0.382   0.192    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> premium      0.185   0.645    21</span></span>
<span></span></code></pre>

</div>

Please note that the results themselves aren't the main focus here, as the primary goal is to demonstrate how the approach works in general.

Next, we'll inspect the coefficients, their size and their p-values. We'll select the `product` and `res` columns and `unnest` the latter. Additionally, since we're not interested in the size of the intercept, we'll filter out those rows.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_prod_nested_res</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>product</span>, <span class='nv'>res</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/nest.html'>unnest</a></span><span class='o'>(</span><span class='nv'>res</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>term</span> <span class='o'>!=</span> <span class='s'>"(Intercept)"</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 15 × 6</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Groups:   product [3]</span></span></span>
<span><span class='c'>#&gt;    product  term           estimate std.error statistic p.value</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>             <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> advanced postal_rating   0.396       0.483   0.819     0.434</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> advanced phone_rating   -<span style='color: #BB0000;'>0.235</span>       0.423  -<span style='color: #BB0000;'>0.556</span>     0.592</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> advanced email_rating    0.349       0.485   0.720     0.490</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> advanced website_rating  0.398       0.456   0.874     0.405</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> advanced shop_rating    -<span style='color: #BB0000;'>0.001</span><span style='color: #BB0000; text-decoration: underline;'>83</span>     0.288  -<span style='color: #BB0000;'>0.006</span><span style='color: #BB0000; text-decoration: underline;'>37</span>   0.995</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> basic    postal_rating  -<span style='color: #BB0000;'>0.324</span>       0.225  -<span style='color: #BB0000;'>1.44</span>      0.172</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> basic    phone_rating   -<span style='color: #BB0000;'>0.297</span>       0.237  -<span style='color: #BB0000;'>1.25</span>      0.231</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> basic    email_rating   -<span style='color: #BB0000;'>0.136</span>       0.249  -<span style='color: #BB0000;'>0.547</span>     0.593</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> basic    website_rating  0.229       0.229   1.00      0.334</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> basic    shop_rating     0.321       0.259   1.24      0.235</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>11</span> premium  postal_rating   0.053<span style='text-decoration: underline;'>8</span>      0.220   0.245     0.810</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>12</span> premium  phone_rating   -<span style='color: #BB0000;'>0.508</span>       0.307  -<span style='color: #BB0000;'>1.65</span>      0.119</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>13</span> premium  email_rating    0.375       0.309   1.22      0.243</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>14</span> premium  website_rating -<span style='color: #BB0000;'>0.175</span>       0.259  -<span style='color: #BB0000;'>0.677</span>     0.509</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>15</span> premium  shop_rating     0.049<span style='text-decoration: underline;'>8</span>      0.203   0.246     0.809</span></span>
<span></span></code></pre>

</div>

From this point, we could further manipulate the resulting data, such as filtering out non-significant coefficients or plotting the model results, and so on.

To wrap up this section, the info box below highlights how the approach above deviates from the original syntax introduced in R4DS.

<div class="info-box" title="Expand: The original syntax">

There are two main differences between the approach outlined above and the syntax which was originally introduced in R4DS.

First, instead of `nest_by(product)`, the original syntax used `group_by(product) %>% nest()`. Both produce a nested `data.frame`. The later, however, returns a `data.frame` grouped by "product", while [`nest_by()`](https://dplyr.tidyverse.org/reference/nest_by.html) returns a `rowwise` `data.frame`.

While this difference seems negligible, it at has implications on how operations on the nested data are carried out, especially, since `rowwise` operations didn't exist in 2017. The original approach was using [`purrr::map()`](https://purrr.tidyverse.org/reference/map.html) and friends instead to apply unvectorized functions, such as [`lm()`](https://rdrr.io/r/stats/lm.html), to list-columns.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_named</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/group_by.html'>group_by</a></span><span class='o'>(</span><span class='nv'>product</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/nest.html'>nest</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/group_by.html'>ungroup</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod     <span class='o'>=</span> <span class='nf'><a href='https://purrr.tidyverse.org/reference/map.html'>map</a></span><span class='o'>(</span><span class='nv'>data</span>, <span class='o'>~</span> <span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>my_formula</span>, data <span class='o'>=</span> <span class='nv'>.x</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         res     <span class='o'>=</span> <span class='nf'><a href='https://purrr.tidyverse.org/reference/map.html'>map</a></span><span class='o'>(</span><span class='nv'>mod</span>, <span class='nf'>broom</span><span class='nf'>::</span><span class='nv'><a href='https://generics.r-lib.org/reference/tidy.html'>tidy</a></span><span class='o'>)</span>,</span>
<span>         modstat <span class='o'>=</span> <span class='nf'><a href='https://purrr.tidyverse.org/reference/map.html'>map</a></span><span class='o'>(</span><span class='nv'>mod</span>, <span class='nf'>broom</span><span class='nf'>::</span><span class='nv'><a href='https://generics.r-lib.org/reference/glance.html'>glance</a></span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 3 × 5</span></span></span>
<span><span class='c'>#&gt;   product  data              mod    res              modstat          </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>            <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>           <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>           </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> advanced <span style='color: #555555;'>&lt;tibble [40 × 8]&gt;</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span> <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> premium  <span style='color: #555555;'>&lt;tibble [50 × 8]&gt;</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span> <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> basic    <span style='color: #555555;'>&lt;tibble [60 × 8]&gt;</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span> <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span></span></span>
<span></span></code></pre>

</div>

While this approach saves us from wrapping the output in [`list()`](https://rdrr.io/r/base/list.html), it leads to code cluttering especially with functions that take two or more arguments and which need to be wrapped in [`pmap()`](https://purrr.tidyverse.org/reference/pmap.html).

</div>

## Extensions

Building on the basic approach outlined above, we'll introduce five advanced building blocks that help to tackle more complex use cases.

1.  create an overall category with [`bind_rows()`](https://dplyr.tidyverse.org/reference/bind_rows.html)
2.  add subgroups through filters with [`expand_grid()`](https://tidyr.tidyverse.org/reference/expand_grid.html)
3.  dynamically name list elements with [`rlang::list2()`](https://rlang.r-lib.org/reference/list2.html)
4.  use data-less grids
5.  build formulas programmatically with [`reformulate()`](https://rdrr.io/r/stats/delete.response.html)

#### Create an overall category with 'bind_rows()'

Often we want to run an analysis not only on different subsets of the data but also on the entire dataset simultaneously. We can achieve this by using [`mutate()`](https://dplyr.tidyverse.org/reference/mutate.html) and [`bind_rows()`](https://dplyr.tidyverse.org/reference/bind_rows.html) to create an additional overall product category that encompasses all products.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_all</span> <span class='o'>&lt;-</span> <span class='nv'>csat_named</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>product <span class='o'>=</span> <span class='s'>"All"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/bind_rows.html'>bind_rows</a></span><span class='o'>(</span><span class='nv'>csat_named</span><span class='o'>)</span> </span>
<span></span>
<span><span class='nv'>csat_all</span> <span class='o'>|&gt;</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/count.html'>count</a></span><span class='o'>(</span><span class='nv'>product</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 4 × 2</span></span></span>
<span><span class='c'>#&gt;   product      n</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All        150</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> advanced    40</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> basic       60</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span> premium     50</span></span>
<span></span></code></pre>

</div>

First, we use [`mutate()`](https://dplyr.tidyverse.org/reference/mutate.html) to overwrite the 'product' column with the value "All" effectively grouping all products together under this new label. We then use [`bind_rows()`](https://dplyr.tidyverse.org/reference/bind_rows.html) to merge the original `csat_named` dataset with the modified dataset from the previous step. This results in a new dataset called `csat_all` that contains the original data and an extra set of rows where the product category is labeled as "All". Consequently, the new dataset is twice the size of the original data, as it includes each row twice.

Now we can apply the same analysis as above:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_all</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/nest_by.html'>nest_by</a></span><span class='o'>(</span><span class='nv'>product</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod     <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>my_formula</span>, data <span class='o'>=</span> <span class='nv'>data</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         res     <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/tidy.html'>tidy</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         modstat <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/glance.html'>glance</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span></code></pre>

</div>

<div class="output-box" title="Expand to show output">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 4 × 5</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise:  product</span></span></span>
<span><span class='c'>#&gt;   product                data mod    res              modstat          </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;list&lt;tibble[,8]&gt;&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>           <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>           </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All               <span style='color: #555555;'>[150 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span> <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> advanced           <span style='color: #555555;'>[40 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span> <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> basic              <span style='color: #555555;'>[60 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span> <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span> premium            <span style='color: #555555;'>[50 × 8]</span> <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [6 × 5]&gt;</span> <span style='color: #555555;'>&lt;tibble [1 × 12]&gt;</span></span></span>
<span></span></code></pre>

</div>

</div>

#### Add subgroups through filters with 'expand_grid()'

Sometimes, we may want to create additional subgroups that meet specific filter criteria. For instance, we might want to analyze all customers and, at the same time, compare the results with an analysis of all customers who are not of the "reactivate" type.

To achieve this, we'll follow three steps:

1.  We create a list of filter expressions, referred to as `filter_ls`.

    <div class="highlight">

    <pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>filter_ls</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span></span>
    <span>  All <span class='o'>=</span> <span class='kc'>TRUE</span>,</span>
    <span>  no_reactivate <span class='o'>=</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/expr.html'>expr</a></span><span class='o'>(</span><span class='nv'>type</span> <span class='o'>!=</span> <span class='s'>"reactivate"</span><span class='o'>)</span></span>
    <span><span class='o'>)</span></span>
    <span></span>
    <span><span class='nv'>filter_ls</span></span>
    <span><span class='c'>#&gt; $All</span></span>
    <span><span class='c'>#&gt; [1] TRUE</span></span>
    <span><span class='c'>#&gt; </span></span>
    <span><span class='c'>#&gt; $no_reactivate</span></span>
    <span><span class='c'>#&gt; type != "reactivate"</span></span>
    <span></span></code></pre>

    </div>

    This results in a list where each element is either `TRUE` or an unevaluated expression that we'll use later inside [`filter()`](https://dplyr.tidyverse.org/reference/filter.html). Note that we use [`rlang::expr()`](https://rlang.r-lib.org/reference/expr.html) to capture an expression, although we could have used [`substitute()`](https://rdrr.io/r/base/substitute.html) or [`quote()`](https://rdrr.io/r/base/substitute.html) instead. Omitting any of these function would result in an error, as R would try to evaluate `type` which is not desired since we want to delay the evaluation until later.

2.  We expand our nested `data.frame` for each filter category using [`expand_grid()`](https://tidyr.tidyverse.org/reference/expand_grid.html).

    <div class="highlight">

    <pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_all_grps</span> <span class='o'>&lt;-</span> <span class='nv'>csat_all</span> <span class='o'>|&gt;</span></span>
    <span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/nest_by.html'>nest_by</a></span><span class='o'>(</span><span class='nv'>product</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
    <span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/expand_grid.html'>expand_grid</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
    <span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>type <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span>,</span>
    <span>         .after <span class='o'>=</span> <span class='nv'>product</span><span class='o'>)</span></span>
    <span></span>
    <span><span class='nv'>csat_all_grps</span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 8 × 4</span></span></span>
    <span><span class='c'>#&gt;   product  type                        data filter_ls   </span></span>
    <span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;list&lt;tibble[,8]&gt;&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;named list&gt;</span></span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All      All                    <span style='color: #555555;'>[150 × 8]</span> <span style='color: #555555;'>&lt;lgl [1]&gt;</span>   </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>2</span> All      no_reactivate          <span style='color: #555555;'>[150 × 8]</span> <span style='color: #555555;'>&lt;language&gt;</span>  </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>3</span> advanced All                     <span style='color: #555555;'>[40 × 8]</span> <span style='color: #555555;'>&lt;lgl [1]&gt;</span>   </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>4</span> advanced no_reactivate           <span style='color: #555555;'>[40 × 8]</span> <span style='color: #555555;'>&lt;language&gt;</span>  </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>5</span> basic    All                     <span style='color: #555555;'>[60 × 8]</span> <span style='color: #555555;'>&lt;lgl [1]&gt;</span>   </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>6</span> basic    no_reactivate           <span style='color: #555555;'>[60 × 8]</span> <span style='color: #555555;'>&lt;language&gt;</span>  </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>7</span> premium  All                     <span style='color: #555555;'>[50 × 8]</span> <span style='color: #555555;'>&lt;lgl [1]&gt;</span>   </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>8</span> premium  no_reactivate           <span style='color: #555555;'>[50 × 8]</span> <span style='color: #555555;'>&lt;language&gt;</span></span></span>
    <span></span></code></pre>

    </div>

    We use[`tidyr::expand_grid()`](https://tidyr.tidyverse.org/reference/expand_grid.html) to expand our nested data for each category in our list of filter expressions: `filter_ls`. We also add a new column, `type`, which shows the name of each element in `filter_ls`. Looking at the output reveals that our original nested `data.frame` contained four rows, while our data now holds eight rows - one for each combination of `product` and `type`.

3.  We apply each filter to our data `rowwise` using `dplyr::filter(eval(filter_ls))`.

    <div class="highlight">

    <pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_all_grps_grid</span> <span class='o'>&lt;-</span> <span class='nv'>csat_all_grps</span> <span class='o'>|&gt;</span></span>
    <span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
    <span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>data <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span></span>
    <span>    <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>data</span>, <span class='nf'><a href='https://rdrr.io/r/base/eval.html'>eval</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span><span class='o'>)</span></span>
    <span>    <span class='o'>)</span>,</span>
    <span>    .keep <span class='o'>=</span> <span class='s'>"unused"</span></span>
    <span>  <span class='o'>)</span></span>
    <span></span>
    <span><span class='nv'>csat_all_grps_grid</span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 8 × 3</span></span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise: </span></span></span>
    <span><span class='c'>#&gt;   product  type          data              </span></span>
    <span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>            </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All      All           <span style='color: #555555;'>&lt;tibble [150 × 8]&gt;</span></span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>2</span> All      no_reactivate <span style='color: #555555;'>&lt;tibble [120 × 8]&gt;</span></span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>3</span> advanced All           <span style='color: #555555;'>&lt;tibble [40 × 8]&gt;</span> </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>4</span> advanced no_reactivate <span style='color: #555555;'>&lt;tibble [32 × 8]&gt;</span> </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>5</span> basic    All           <span style='color: #555555;'>&lt;tibble [60 × 8]&gt;</span> </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>6</span> basic    no_reactivate <span style='color: #555555;'>&lt;tibble [46 × 8]&gt;</span> </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>7</span> premium  All           <span style='color: #555555;'>&lt;tibble [50 × 8]&gt;</span> </span></span>
    <span><span class='c'>#&gt; <span style='color: #555555;'>8</span> premium  no_reactivate <span style='color: #555555;'>&lt;tibble [42 × 8]&gt;</span></span></span>
    <span></span></code></pre>

    </div>

    We use `mutate` to apply [`filter()`](https://dplyr.tidyverse.org/reference/filter.html) to each `data.frame` in the `data` column in each row. As filter expression we use the column `filter_ls` and evaluate it. Since we no longer need this column, we set the `.keep` argument in `mutate` to "unused" to eventually drop `filter_ls` after it has been used.

From this point, we could continue applying our model and then calculating and extracting the results, but we'll omit this for the sake of brevity.

<div class="output-box" title="Expand to show code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_all_grps_grid</span> <span class='o'>&lt;-</span> <span class='nv'>csat_all_grps</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>my_formula</span>, data <span class='o'>=</span> <span class='nv'>data</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         res <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/tidy.html'>tidy</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         modstat <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/glance.html'>glance</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>csat_all_grps_grid</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>product</span>, <span class='nv'>type</span>, <span class='nv'>modstat</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/nest.html'>unnest</a></span><span class='o'>(</span><span class='nv'>modstat</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='o'>-</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='nv'>sigma</span>, <span class='nv'>statistic</span>, <span class='nv'>df</span><span class='o'>:</span><span class='nv'>df.residual</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 8 × 6</span></span></span>
<span><span class='c'>#&gt;   product  type          r.squared adj.r.squared p.value  nobs</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>             <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All      All               0.134        0.047<span style='text-decoration: underline;'>9</span>   0.191    56</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> All      no_reactivate     0.134        0.047<span style='text-decoration: underline;'>9</span>   0.191    56</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> advanced All               0.112       -<span style='color: #BB0000;'>0.381</span>    0.941    15</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span> advanced no_reactivate     0.112       -<span style='color: #BB0000;'>0.381</span>    0.941    15</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span> basic    All               0.382        0.161    0.192    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>6</span> basic    no_reactivate     0.382        0.161    0.192    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>7</span> premium  All               0.185       -<span style='color: #BB0000;'>0.086</span><span style='color: #BB0000; text-decoration: underline;'>7</span>   0.645    21</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>8</span> premium  no_reactivate     0.185       -<span style='color: #BB0000;'>0.086</span><span style='color: #BB0000; text-decoration: underline;'>7</span>   0.645    21</span></span>
<span></span><span></span>
<span><span class='nv'>csat_all_grps_grid</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>product</span>, <span class='nv'>type</span>, <span class='nv'>res</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/nest.html'>unnest</a></span><span class='o'>(</span><span class='nv'>res</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>term</span> <span class='o'>==</span> <span class='s'>"website_rating"</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 8 × 7</span></span></span>
<span><span class='c'>#&gt;   product  type          term           estimate std.error statistic p.value</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>             <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All      All           website_rating   0.072<span style='text-decoration: underline;'>9</span>     0.141     0.517   0.607</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> All      no_reactivate website_rating   0.072<span style='text-decoration: underline;'>9</span>     0.141     0.517   0.607</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> advanced All           website_rating   0.398      0.456     0.874   0.405</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span> advanced no_reactivate website_rating   0.398      0.456     0.874   0.405</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span> basic    All           website_rating   0.229      0.229     1.00    0.334</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>6</span> basic    no_reactivate website_rating   0.229      0.229     1.00    0.334</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>7</span> premium  All           website_rating  -<span style='color: #BB0000;'>0.175</span>      0.259    -<span style='color: #BB0000;'>0.677</span>   0.509</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>8</span> premium  no_reactivate website_rating  -<span style='color: #BB0000;'>0.175</span>      0.259    -<span style='color: #BB0000;'>0.677</span>   0.509</span></span>
<span></span></code></pre>

</div>

</div>

Although this example is relatively simple, it demonstrates how this approach can be significantly expanded by providing more filter expressions in our `filter_ls` list or by using multiple lists of filter expressions. This is particularly useful when performing robustness checks, where we attempt to reproduce the original findings on specific subgroups of our data.

#### Dynamically name list elements with 'rlang::list2()'

So far, we've wrapped the results of our `rowwise` operations in [`list()`](https://rdrr.io/r/base/list.html) when they produced non-atomic vectors.

A common issue when inspecting the results is that these list-columns are often unnamed, making it difficult to determine which element we're examining. For instance, suppose that we want to double-check the output of our call to `broom::glance(mod)` stored in the `modstat` column. Let's look at the fourth element:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_all_grps_grid</span><span class='o'>$</span><span class='nv'>modstat</span><span class='o'>[</span><span class='m'>4</span><span class='o'>]</span></span>
<span><span class='c'>#&gt; [[1]]</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 1 × 12</span></span></span>
<span><span class='c'>#&gt;   r.squ…¹ adj.r…² sigma stati…³ p.value    df logLik   AIC   BIC devia…⁴ df.re…⁵</span></span>
<span><span class='c'>#&gt;     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>  <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>   0.112  -<span style='color: #BB0000;'>0.381</span>  1.39   0.228   0.941     5  -<span style='color: #BB0000;'>22.4</span>  58.9  63.8    17.5       9</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 1 more variable: nobs &lt;int&gt;, and abbreviated variable names</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>#   ¹​r.squared, ²​adj.r.squared, ³​statistic, ⁴​deviance, ⁵​df.residual</span></span></span>
<span></span></code></pre>

</div>

The result prints nicely, but it's unclear which subset of the data it belongs to.

Here [`rlang::list2()`](https://rlang.r-lib.org/reference/list2.html) comes to the rescue. Although it resembles [`list()`](https://rdrr.io/r/base/list.html), it provides some extra functionality. Specifically, it allows us to unquote names on the right-hand side of the walrus operator. To better grasp this idea, let's look at an example.

We wrap our calls to [`lm()`](https://rdrr.io/r/stats/lm.html), [`tidy()`](https://generics.r-lib.org/reference/tidy.html) and [`glance()`](https://generics.r-lib.org/reference/glance.html) in [`list2()`](https://rlang.r-lib.org/reference/list2.html) and name each element using the walrus operator `:=`. On the right-hand side of the walrus operator, we use the <a href="https://rlang.r-lib.org/reference/glue-operators.html" role="highlight" target="_blank">glue operator</a> `{` within a string to dynamically name each element according to the values in the `product` and `type` columns in each row. When we inspect the fourth element of the `modstat` column, we can quickly see that these model statistics belong to the subset of customers with an "advanced" product and who are not of type "reactivate".

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_all_grps_grid</span> <span class='o'>&lt;-</span> <span class='nv'>csat_all_grps</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod     <span class='o'>=</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/list2.html'>list2</a></span><span class='o'>(</span><span class='s'>"&#123;product&#125;_&#123;type&#125;"</span> <span class='o'>:=</span> <span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>my_formula</span>, data <span class='o'>=</span> <span class='nv'>data</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         res     <span class='o'>=</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/list2.html'>list2</a></span><span class='o'>(</span><span class='s'>"&#123;product&#125;_&#123;type&#125;"</span> <span class='o'>:=</span> <span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/tidy.html'>tidy</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         modstat <span class='o'>=</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/list2.html'>list2</a></span><span class='o'>(</span><span class='s'>"&#123;product&#125;_&#123;type&#125;"</span> <span class='o'>:=</span> <span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/glance.html'>glance</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>csat_all_grps_grid</span><span class='o'>$</span><span class='nv'>modstat</span><span class='o'>[</span><span class='m'>4</span><span class='o'>]</span></span>
<span><span class='c'>#&gt; $advanced_no_reactivate</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 1 × 12</span></span></span>
<span><span class='c'>#&gt;   r.squ…¹ adj.r…² sigma stati…³ p.value    df logLik   AIC   BIC devia…⁴ df.re…⁵</span></span>
<span><span class='c'>#&gt;     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>  <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span>   0.112  -<span style='color: #BB0000;'>0.381</span>  1.39   0.228   0.941     5  -<span style='color: #BB0000;'>22.4</span>  58.9  63.8    17.5       9</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 1 more variable: nobs &lt;int&gt;, and abbreviated variable names</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>#   ¹​r.squared, ²​adj.r.squared, ³​statistic, ⁴​deviance, ⁵​df.residual</span></span></span>
<span></span></code></pre>

</div>

#### Data-less grids

Using the methods described above, we can easily construct nested `data.frame`s with several dozen subgroups. However, this approach can be inefficient in terms of memory usage, as we create a copy of our data for every single subgroup. To make this approach more memory-efficient, we can use what I call a "data-less grid", which is similar to our original nested `data.frame`, but without the data column.

Instead of nesting our data with [`nest_by()`](https://dplyr.tidyverse.org/reference/nest_by.html), we manually create the combinations of subgroups to which we want to apply our model. We start with a vector of all unique values in the `product` column and add an overall category "All" to it. Then, we supply this vector along with our list of filter expressions `filter_ls` to [`expand_grid()`](https://tidyr.tidyverse.org/reference/expand_grid.html). Finally, we place the names of the elements in `filter_ls` in a separate column: `type`.

This results in an initial grid `all_grps_grid` of combinations between `product` and `type`, with an additional column of filter expressions.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>product</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span></span>
<span>  <span class='s'>"All"</span>, <span class='nf'><a href='https://rdrr.io/r/base/unique.html'>unique</a></span><span class='o'>(</span><span class='nv'>csat_named</span><span class='o'>$</span><span class='nv'>product</span><span class='o'>)</span></span>
<span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://tidyr.tidyverse.org/reference/expand_grid.html'>expand_grid</a></span><span class='o'>(</span><span class='nv'>product</span>, <span class='nv'>filter_ls</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>type <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span>,</span>
<span>         .after <span class='o'>=</span> <span class='nv'>product</span><span class='o'>)</span></span></code></pre>

</div>

The challenging aspect here is generating each data subset on the fly in the call to [`lm()`](https://rdrr.io/r/stats/lm.html). To accomplish this, we [`filter()`](https://dplyr.tidyverse.org/reference/filter.html) our initial data `csat_named` on two conditions:

1.  Firstly, we filter for different `product` types using an advanced filter expression:

    `.env$product == "All" | .env$product == product`.

    This expression may appear somewhat obscure, so let's break it down:

    The issue here is that both our original data `csat_named` and our grid `all_grps_grid` contain a column named `product`. By default, `product`, in the [`filter()`](https://dplyr.tidyverse.org/reference/filter.html) call below, refers to the column in `csat_named`. To tell 'dyplr' to use the column in our grid `all_grps_grid` we use the `.env` <a href="https://rlang.r-lib.org/reference/dot-data.html" role="highlight" target="_blank">pronoun</a>.

    So, the filter expression above essentially states: If the product category in our grid `.env$product` is "All", then select all rows. This works because when the left side of the or-condition `.env$product == "All"` evaluates to `TRUE`, `filter` selects all rows. If the first part of our condition is not true, then the `product` column in `csat_named` should match the value of the `product` column of our data-less grid `.env$product`.

2.  Next, we filter the different `type`s of customers. Here, we use the filter expressions stored in `filter_ls` and evaluate them.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>all_grps_grid_mod</span> <span class='o'>&lt;-</span> <span class='nv'>all_grps_grid</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>my_formula</span>,</span>
<span>       data <span class='o'>=</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>csat_named</span>,</span>
<span>                     <span class='c'># 1. filter product categories</span></span>
<span>                     <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='s'>"All"</span> <span class='o'>|</span> <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='nv'>product</span>,</span>
<span>                     </span>
<span>                     <span class='c'># 2. filter customer types</span></span>
<span>                     <span class='nf'><a href='https://rdrr.io/r/base/eval.html'>eval</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span> </span>
<span>                     <span class='o'>)</span></span>
<span>       <span class='o'>)</span></span>
<span>    <span class='o'>)</span></span>
<span>    <span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='o'>!</span> <span class='nv'>filter_ls</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid_mod</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 8 × 3</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise: </span></span></span>
<span><span class='c'>#&gt;   product  type          mod   </span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All      All           <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> All      no_reactivate <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> advanced All           <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span> advanced no_reactivate <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span> premium  All           <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>6</span> premium  no_reactivate <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>7</span> basic    All           <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>8</span> basic    no_reactivate <span style='color: #555555;'>&lt;lm&gt;</span></span></span>
<span></span></code></pre>

</div>

This returns our initial grid, now extended by an additional column, `mod`, containing the linear models.

The remaining steps do not significantly differ from our initial approach, so we will omit them for brevity.

<div class="output-box" title="Expand to show code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>all_grps_grid_res</span> <span class='o'>&lt;-</span> <span class='nv'>all_grps_grid_mod</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>res     <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/tidy.html'>tidy</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span>         modstat <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/glance.html'>glance</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span> </span>
<span></span>
<span><span class='nv'>all_grps_grid_res</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>product</span>, <span class='nv'>type</span>, <span class='nv'>modstat</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/nest.html'>unnest</a></span><span class='o'>(</span><span class='nv'>modstat</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='o'>-</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='nv'>sigma</span>, <span class='nv'>statistic</span>, <span class='nv'>df</span><span class='o'>:</span><span class='nv'>df.residual</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 8 × 6</span></span></span>
<span><span class='c'>#&gt;   product  type          r.squared adj.r.squared p.value  nobs</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>             <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> All      All               0.134        0.047<span style='text-decoration: underline;'>9</span>   0.191    56</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> All      no_reactivate     0.180        0.077<span style='text-decoration: underline;'>1</span>   0.145    46</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> advanced All               0.112       -<span style='color: #BB0000;'>0.381</span>    0.941    15</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span> advanced no_reactivate     0.330       -<span style='color: #BB0000;'>0.340</span>    0.772    11</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>5</span> premium  All               0.185       -<span style='color: #BB0000;'>0.086</span><span style='color: #BB0000; text-decoration: underline;'>7</span>   0.645    21</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>6</span> premium  no_reactivate     0.156       -<span style='color: #BB0000;'>0.196</span>    0.810    18</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>7</span> basic    All               0.382        0.161    0.192    20</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>8</span> basic    no_reactivate     0.465        0.221    0.172    17</span></span>
<span></span></code></pre>

</div>

</div>

#### Build formulas programmatically with 'reformulate'

One final building block that essentially completes the many models approach is actually a base R function: [`reformulate()`](https://rdrr.io/r/stats/delete.response.html).

I recently posted an #RStats meme on Twitter highlighting that [`reformulate()`](https://rdrr.io/r/stats/delete.response.html) is one of the lesser-known base R functions, even among advanced users. The reactions to my post largely confirmed my impression.

<e-frame src="https://twitter.com/timteafan/status/1636839375672602624"></e-frame>

Before applying it in the many models context, let's have a look at what [`reformulate()`](https://rdrr.io/r/stats/delete.response.html) does. Instead of manually creating a formula object by typing `y ~ x1 + x2`, we can use [`reformulate()`](https://rdrr.io/r/stats/delete.response.html) to generate a formula object based on character vectors.

Important is the order of the first two arguments. While we start writing a formula from the left-hand side `y`, [`reformulate()`](https://rdrr.io/r/stats/delete.response.html) takes as first argument the right-hand side.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>form1</span> <span class='o'>&lt;-</span> <span class='nv'>y</span> <span class='o'>~</span> <span class='nv'>x1</span> <span class='o'>+</span> <span class='nv'>x2</span></span>
<span><span class='nv'>form1</span> </span>
<span><span class='c'>#&gt; y ~ x1 + x2</span></span>
<span></span><span></span>
<span><span class='nv'>form2</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/stats/delete.response.html'>reformulate</a></span><span class='o'>(</span>termlabels <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"x1"</span>, <span class='s'>"x2"</span><span class='o'>)</span>,</span>
<span>                     response <span class='o'>=</span> <span class='s'>"y"</span><span class='o'>)</span></span>
<span><span class='nv'>form2</span></span>
<span><span class='c'>#&gt; y ~ x1 + x2</span></span>
<span></span><span></span>
<span><span class='nf'><a href='https://rdrr.io/r/base/identical.html'>identical</a></span><span class='o'>(</span><span class='nv'>form1</span>, <span class='nv'>form2</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; [1] TRUE</span></span>
<span></span></code></pre>

</div>

How can we make use of [`reformulate()`](https://rdrr.io/r/stats/delete.response.html) in the many models approach?

Let's begin with a simple case and assume we want to construct a separate model for each independent variable, containing only our response variable and one independent variable at a time: `csat ~ indepedent_variable`. And of course, we want to do this for all of our subgroups of the previous approach.

First, we need a character vector holding the names of our independent variables. With this vector, we can now expand our data-less grid from above. This results in a new grid with 40 rows (eight subgroups times five independent variables).

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>indep_vars</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"postal_rating"</span>,</span>
<span>                <span class='s'>"phone_rating"</span>,</span>
<span>                <span class='s'>"email_rating"</span>,</span>
<span>                <span class='s'>"website_rating"</span>,</span>
<span>                <span class='s'>"shop_rating"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid_vars</span> <span class='o'>&lt;-</span> <span class='nv'>all_grps_grid</span> <span class='o'>|&gt;</span></span>
<span>   <span class='nf'><a href='https://tidyr.tidyverse.org/reference/expand_grid.html'>expand_grid</a></span><span class='o'>(</span><span class='nv'>indep_vars</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid_vars</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 40 × 4</span></span></span>
<span><span class='c'>#&gt;    product type          filter_ls    indep_vars    </span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;named list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> All     All           <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    postal_rating </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> All     All           <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    phone_rating  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> All     All           <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    email_rating  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> All     All           <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    website_rating</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> All     All           <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    shop_rating   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> All     no_reactivate <span style='color: #555555;'>&lt;language&gt;</span>   postal_rating </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> All     no_reactivate <span style='color: #555555;'>&lt;language&gt;</span>   phone_rating  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> All     no_reactivate <span style='color: #555555;'>&lt;language&gt;</span>   email_rating  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> All     no_reactivate <span style='color: #555555;'>&lt;language&gt;</span>   website_rating</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> All     no_reactivate <span style='color: #555555;'>&lt;language&gt;</span>   shop_rating   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 30 more rows</span></span></span>
<span></span></code></pre>

</div>

We can now apply a similar approach as before, creating data subgroups on the fly. The only change is that we use `reformulate(indep_vars, "csat")` instead of our formula object `my_formula`. This adds forty different linear models to our grid:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>all_grps_grid_vars_mod</span> <span class='o'>&lt;-</span> <span class='nv'>all_grps_grid_vars</span> <span class='o'>|&gt;</span></span>
<span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>mod <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/stats/delete.response.html'>reformulate</a></span><span class='o'>(</span><span class='nv'>indep_vars</span>, <span class='s'>"csat"</span><span class='o'>)</span>, <span class='c'># &lt;- this part is new</span></span>
<span>       data <span class='o'>=</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>csat_named</span>,</span>
<span>                     <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='s'>"All"</span> <span class='o'>|</span> <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='nv'>product</span>,</span>
<span>                     <span class='nf'><a href='https://rdrr.io/r/base/eval.html'>eval</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span></span>
<span>       <span class='o'>)</span></span>
<span>    <span class='o'>)</span></span>
<span>  <span class='o'>)</span></span>
<span>  <span class='o'>)</span> <span class='o'><a href='https://magrittr.tidyverse.org/reference/pipe.html'>%&gt;%</a></span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='o'>!</span> <span class='nv'>filter_ls</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid_vars_mod</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 40 × 4</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise: </span></span></span>
<span><span class='c'>#&gt;    product type          indep_vars     mod   </span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>          <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> All     All           postal_rating  <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> All     All           phone_rating   <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> All     All           email_rating   <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> All     All           website_rating <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> All     All           shop_rating    <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> All     no_reactivate postal_rating  <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> All     no_reactivate phone_rating   <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> All     no_reactivate email_rating   <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> All     no_reactivate website_rating <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> All     no_reactivate shop_rating    <span style='color: #555555;'>&lt;lm&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 30 more rows</span></span></span>
<span></span></code></pre>

</div>

Although the example above is instructive, it isn't particularly useful. In most cases, we don't want to create a separate model for each independent variable. A much more powerful way to use [`reformulate()`](https://rdrr.io/r/stats/delete.response.html) is to [`update()`](https://rdrr.io/r/stats/update.html) a baseline model with additional variables.

Let's say we have the following base-line model:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>my_formula2</span> <span class='o'>&lt;-</span> <span class='nv'>csat</span> <span class='o'>~</span> <span class='nv'>postal_rating</span> <span class='o'>+</span> <span class='nv'>phone_rating</span> <span class='o'>+</span> <span class='nv'>shop_rating</span></span>
<span><span class='nv'>my_formula2</span></span>
<span><span class='c'>#&gt; csat ~ postal_rating + phone_rating + shop_rating</span></span>
<span></span></code></pre>

</div>

For our many subgroups from above, we want to check if adding `email_rating` or `website_rating` improves our model. Let's create a list of terms that we want to add to our model: `update_vars`. Note that we need to include `NULL`, as this will represent our baseline model. Again, we expand our grid from above with this list and put the names of each variable ("base", "email", and "website") in a separate column to keep track of which model we are examining.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>update_vars</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span>base <span class='o'>=</span> <span class='kc'>NULL</span>,</span>
<span>                    email <span class='o'>=</span> <span class='s'>"email_rating"</span>,</span>
<span>                    website <span class='o'>=</span> <span class='s'>"website_rating"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grid_upd_vars</span> <span class='o'>&lt;-</span> <span class='nv'>all_grps_grid</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/expand_grid.html'>expand_grid</a></span><span class='o'>(</span><span class='nv'>update_vars</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>model_spec <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/names.html'>names</a></span><span class='o'>(</span><span class='nv'>update_vars</span><span class='o'>)</span>,</span>
<span>         .after <span class='o'>=</span> <span class='nv'>type</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grid_upd_vars</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 24 × 5</span></span></span>
<span><span class='c'>#&gt;    product  type          model_spec filter_ls    update_vars </span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>      <span style='color: #555555; font-style: italic;'>&lt;named list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;named list&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> All      All           base       <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;NULL&gt;</span>      </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> All      All           email      <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> All      All           website    <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> All      no_reactivate base       <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;NULL&gt;</span>      </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> All      no_reactivate email      <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;chr [1]&gt;</span>   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> All      no_reactivate website    <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;chr [1]&gt;</span>   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> advanced All           base       <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;NULL&gt;</span>      </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> advanced All           email      <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> advanced All           website    <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> advanced no_reactivate base       <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;NULL&gt;</span>      </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 14 more rows</span></span></span>
<span></span></code></pre>

</div>

We could use [`update()`](https://rdrr.io/r/stats/update.html) directly in our call to [`lm()`](https://rdrr.io/r/stats/lm.html), but to avoid overcomplicating things, let's create a column holding our updated formula, `form`, and use that in our call to [`lm()`](https://rdrr.io/r/stats/lm.html):

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>all_grid_upd_vars_form</span> <span class='o'>&lt;-</span> <span class='nv'>all_grid_upd_vars</span> <span class='o'>|&gt;</span></span>
<span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>form <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/stats/update.html'>update</a></span><span class='o'>(</span><span class='nv'>my_formula2</span>, <span class='c'># old formula</span></span>
<span>           <span class='nf'><a href='https://rdrr.io/r/stats/delete.response.html'>reformulate</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"."</span>, <span class='nv'>update_vars</span><span class='o'>)</span><span class='o'>)</span><span class='o'>)</span> <span class='c'># changes to formula</span></span>
<span>    <span class='o'>)</span>,</span>
<span>    </span>
<span>    mod<span class='o'>=</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/list2.html'>list2</a></span><span class='o'>(</span> <span class='s'>"&#123;product&#125;_&#123;type&#125;_&#123;model_spec&#125;"</span> <span class='o'>:=</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>form</span>,</span>
<span>       data <span class='o'>=</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>csat_named</span>,</span>
<span>                     <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='s'>"All"</span> <span class='o'>|</span> <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='nv'>product</span>,</span>
<span>                     <span class='nf'><a href='https://rdrr.io/r/base/eval.html'>eval</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span></span>
<span>                     <span class='o'>)</span></span>
<span>       <span class='o'>)</span></span>
<span>    <span class='o'>)</span></span>
<span>  <span class='o'>)</span></span></code></pre>

</div>

[`update()`](https://rdrr.io/r/stats/update.html) takes two arguments, the formula we want to update, in this case `my_formula2`, and the formula we use to update the former. In our case, this is a call to [`reformulate()`](https://rdrr.io/r/stats/delete.response.html) which says: "take all the original term labels `"."`, and add [`c()`](https://rdrr.io/r/base/c.html) to them the variable in `update_vars`. Now its probably clear why we included `NULL` in `update_vars`. In cases where it is `NULL` the original formula won't be updated, which corresponds to our baseline model.

Checking the first three rows of our list-column containing the model shows that the approach works as intended:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nf'><a href='https://rdrr.io/r/utils/head.html'>head</a></span><span class='o'>(</span><span class='nv'>all_grid_upd_vars_form</span><span class='o'>$</span><span class='nv'>mod</span>, <span class='m'>3</span><span class='o'>)</span></span></code></pre>

</div>

<div class="output-box" title="Expand to show code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'>#&gt; $All_All_base</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; Call:</span></span>
<span><span class='c'>#&gt; lm(formula = form, data = filter(csat_named, .env$product == </span></span>
<span><span class='c'>#&gt;     "All" | .env$product == product, eval(filter_ls)))</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; Coefficients:</span></span>
<span><span class='c'>#&gt;   (Intercept)  postal_rating   phone_rating    shop_rating  </span></span>
<span><span class='c'>#&gt;       4.08357        0.02305       -0.26742       -0.11736  </span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; $All_All_email</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; Call:</span></span>
<span><span class='c'>#&gt; lm(formula = form, data = filter(csat_named, .env$product == </span></span>
<span><span class='c'>#&gt;     "All" | .env$product == product, eval(filter_ls)))</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; Coefficients:</span></span>
<span><span class='c'>#&gt;   (Intercept)  postal_rating   phone_rating    shop_rating   email_rating  </span></span>
<span><span class='c'>#&gt;       4.21064       -0.01306       -0.35218       -0.01432        0.01203  </span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; $All_All_website</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; Call:</span></span>
<span><span class='c'>#&gt; lm(formula = form, data = filter(csat_named, .env$product == </span></span>
<span><span class='c'>#&gt;     "All" | .env$product == product, eval(filter_ls)))</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; Coefficients:</span></span>
<span><span class='c'>#&gt;    (Intercept)   postal_rating    phone_rating     shop_rating  website_rating  </span></span>
<span><span class='c'>#&gt;        3.59965        -0.03583        -0.22622        -0.04578         0.13008</span></span>
<span></span></code></pre>

</div>

</div>

#### Save model output to Excel with 'modelsummary()'

Although we previously used the 'broom' package to create tidy `data.frame`s containing the model statistics, `modstat` created with [`broom::glance()`](https://generics.r-lib.org/reference/glance.html), and the model results, `res` created with [`broom::tidy()`](https://generics.r-lib.org/reference/tidy.html), we ideally need both pieces of information when exporting the model output to Excel (or any other spreadsheet).

In this case, the [`modelsummary()`](https://vincentarelbundock.github.io/modelsummary/reference/modelsummary.html) function from the package of the same name proves extremely helpful. It creates an Excel file that includes both model statistics and estimator results, which is convenient when reporting our model findings to a non-R-user audience.

The great feature of [`modelsummary()`](https://vincentarelbundock.github.io/modelsummary/reference/modelsummary.html) is that it accepts list-columns of model objects, such as our `mod` column containing many `lm` objects, as input. We can specify various output formats - below we choose `".xlsx"`. Numerous other arguments allow us to trim the results for a more compact table. Here, we opt to omit the AIC, BIC, RMSE and log likelihood model statistics, as well as the coefficient size of the intercept. Setting the `stars` argument to `TRUE` adds the typical p-value stars to the estimators.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='c'># this saves the results to a `data.frame` in `out` and ...</span></span>
<span><span class='c'># at the same time creates an .xlsx file</span></span>
<span><span class='nv'>out</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://vincentarelbundock.github.io/modelsummary/reference/modelsummary.html'>modelsummary</a></span><span class='o'>(</span>models <span class='o'>=</span> <span class='nv'>all_grid_upd_vars_form</span><span class='o'>$</span><span class='nv'>mod</span>,</span>
<span>                    output <span class='o'>=</span> <span class='s'>"model_results.xlsx"</span>,</span>
<span>                    gof_omit <span class='o'>=</span> <span class='s'>"AIC|BIC|Log.Lik|RMSE"</span>,</span>
<span>                    coef_omit <span class='o'>=</span> <span class='s'>"(Intercept)"</span>,</span>
<span>                    stars <span class='o'>=</span> <span class='kc'>TRUE</span>,</span>
<span>                    statistic <span class='o'>=</span> <span class='kc'>NULL</span><span class='o'>)</span></span></code></pre>

</div>

The following screenshot shows the resulting Excel table:

<div class="highlight">

<img src="excel_screenshot.png" width="700px" style="display: block; margin: auto;" />

</div>

Examining the first few columns shows that not only the results print nicely, but they also include model names indicating the subgroups of each [`lm()`](https://rdrr.io/r/stats/lm.html) call. Accepting a named list-columns of model objects is indeed a fantastic feature of the [`modelsummary()`](https://vincentarelbundock.github.io/modelsummary/reference/modelsummary.html) function.

The call to [`modelsummary()`](https://vincentarelbundock.github.io/modelsummary/reference/modelsummary.html) above gives us a quick and compact overview of our results in Excel. However, one minor issue is that the p-value stars appear in the same column as the model coefficients. For a better presentation and reporting, I prefer having the stars in a separate column. To achieve this, we can set the `output` argument to `"data.frame"`, add the stars as `statistic`, convert the results to long format with [`pivot_wider()`](https://tidyr.tidyverse.org/reference/pivot_wider.html) and save the resulting `data.frame` to Excel with [`openxlsx::write.xlsx()`](https://rdrr.io/pkg/openxlsx/man/write.xlsx.html). Since this is a minor issue, I leave the code for the interested reader in the output box below.

<div class="output-box" title="Expand to show code">

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>out</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://vincentarelbundock.github.io/modelsummary/reference/modelsummary.html'>modelsummary</a></span><span class='o'>(</span>models <span class='o'>=</span> <span class='nv'>all_grid_upd_vars_form</span><span class='o'>$</span><span class='nv'>mod</span><span class='o'>[</span><span class='m'>1</span><span class='o'>:</span><span class='m'>2</span><span class='o'>]</span>,</span>
<span>                    output <span class='o'>=</span> <span class='s'>"data.frame"</span>,</span>
<span>                    gof_omit <span class='o'>=</span> <span class='s'>"AIC|BIC|Log.Lik|RMSE"</span>,</span>
<span>                    coef_omit <span class='o'>=</span> <span class='s'>"(Intercept)"</span>,</span>
<span>                    statistic <span class='o'>=</span> <span class='s'>"stars"</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>statistic <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>statistic</span> <span class='o'>==</span> <span class='s'>""</span>, <span class='s'>"estimate"</span>, <span class='nv'>statistic</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='o'>-</span><span class='nv'>part</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/pivot_wider.html'>pivot_wider</a></span><span class='o'>(</span>names_from <span class='o'>=</span> <span class='nv'>statistic</span>,</span>
<span>              values_from <span class='o'>=</span> <span class='o'>-</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='nv'>term</span>, <span class='nv'>statistic</span><span class='o'>)</span>,</span>
<span>              values_fn <span class='o'>=</span> <span class='nv'>as.numeric</span><span class='o'>)</span></span>
<span></span>
<span><span class='nf'>openxlsx</span><span class='nf'>::</span><span class='nf'><a href='https://rdrr.io/pkg/openxlsx/man/write.xlsx.html'>write.xlsx</a></span><span class='o'>(</span><span class='nv'>out</span>, <span class='s'>"model_results2.xlsx"</span><span class='o'>)</span></span></code></pre>

</div>

</div>

## Endgame

With the building blocks introduced above, we can now combine everything and extend this approach even further.

Let's say we want to compare two different versions of our dependent variable. The original variable and a collapsed top-box version `csat_top` taking `1` if a customer gave the best rating and `0` otherwise.

Again, we create a character vector holding the names of our dependent variables, `dep_vars`, and use it to expand our data-less grid from above.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>csat_named_top</span> <span class='o'>&lt;-</span> <span class='nv'>csat_named</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span>csat_top <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/ifelse.html'>ifelse</a></span><span class='o'>(</span><span class='nv'>csat</span> <span class='o'>==</span> <span class='m'>5</span>, <span class='m'>1</span>, <span class='m'>0</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>dep_vars</span> <span class='o'>&lt;-</span> <span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"csat"</span>, <span class='s'>"csat_top"</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid_final</span> <span class='o'>&lt;-</span> <span class='nv'>all_grid_upd_vars</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/expand_grid.html'>expand_grid</a></span><span class='o'>(</span><span class='nv'>dep_vars</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid_final</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 48 × 6</span></span></span>
<span><span class='c'>#&gt;    product type          model_spec filter_ls    update_vars  dep_vars</span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>      <span style='color: #555555; font-style: italic;'>&lt;named list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;named list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> All     All           base       <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;NULL&gt;</span>       csat    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> All     All           base       <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;NULL&gt;</span>       csat_top</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> All     All           email      <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>    csat    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> All     All           email      <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>    csat_top</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> All     All           website    <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>    csat    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> All     All           website    <span style='color: #555555;'>&lt;lgl [1]&gt;</span>    <span style='color: #555555;'>&lt;chr [1]&gt;</span>    csat_top</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> All     no_reactivate base       <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;NULL&gt;</span>       csat    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> All     no_reactivate base       <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;NULL&gt;</span>       csat_top</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> All     no_reactivate email      <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;chr [1]&gt;</span>    csat    </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> All     no_reactivate email      <span style='color: #555555;'>&lt;language&gt;</span>   <span style='color: #555555;'>&lt;chr [1]&gt;</span>    csat_top</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 38 more rows</span></span></span>
<span></span></code></pre>

</div>

Next, we update the formula, generate the data on the fly, calculate our model and prepare the results using 'broom'. Finally, we drop columns that we don't need anymore.

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>all_grps_grid_final_res</span> <span class='o'>&lt;-</span> <span class='nv'>all_grps_grid_final</span> <span class='o'>|&gt;</span></span>
<span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/rowwise.html'>rowwise</a></span><span class='o'>(</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/mutate.html'>mutate</a></span><span class='o'>(</span></span>
<span>    </span>
<span>  <span class='c'># dynamically name list</span></span>
<span>  form <span class='o'>=</span> <span class='nf'><a href='https://rlang.r-lib.org/reference/list2.html'>list2</a></span><span class='o'>(</span> <span class='s'>"&#123;product&#125;_&#123;type&#125;_&#123;model_spec&#125;_&#123;dep_vars&#125;"</span> <span class='o'>:=</span></span>
<span>  <span class='c'># update formula</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/stats/update.html'>update</a></span><span class='o'>(</span><span class='nv'>my_formula2</span>, <span class='c'># old formula</span></span>
<span>           <span class='nf'><a href='https://rdrr.io/r/stats/delete.response.html'>reformulate</a></span><span class='o'>(</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='s'>"."</span>, <span class='nv'>update_vars</span><span class='o'>)</span>, <span class='nv'>dep_vars</span><span class='o'>)</span><span class='o'>)</span> <span class='c'># changes to formula</span></span>
<span>  <span class='o'>)</span>,</span>
<span>    </span>
<span>  mod <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span></span>
<span>    <span class='nf'><a href='https://rdrr.io/r/stats/lm.html'>lm</a></span><span class='o'>(</span><span class='nv'>form</span>,</span>
<span>  <span class='c'># create data on the fly</span></span>
<span>       data <span class='o'>=</span> <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>csat_named_top</span>,</span>
<span>                     <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='s'>"All"</span> <span class='o'>|</span> <span class='nv'>.env</span><span class='o'>$</span><span class='nv'>product</span> <span class='o'>==</span> <span class='nv'>product</span>,</span>
<span>                     <span class='nf'><a href='https://rdrr.io/r/base/eval.html'>eval</a></span><span class='o'>(</span><span class='nv'>filter_ls</span><span class='o'>)</span></span>
<span>       <span class='o'>)</span></span>
<span>    <span class='o'>)</span></span>
<span>  <span class='o'>)</span>,</span>
<span></span>
<span>  res <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/tidy.html'>tidy</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span>,</span>
<span></span>
<span>  modstat <span class='o'>=</span> <span class='nf'><a href='https://rdrr.io/r/base/list.html'>list</a></span><span class='o'>(</span><span class='nf'>broom</span><span class='nf'>::</span><span class='nf'><a href='https://generics.r-lib.org/reference/glance.html'>glance</a></span><span class='o'>(</span><span class='nv'>mod</span><span class='o'>)</span><span class='o'>)</span></span>
<span></span>
<span>  <span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='nv'>product</span><span class='o'>:</span><span class='nv'>model_spec</span>, <span class='nv'>dep_vars</span>, <span class='nv'>mod</span><span class='o'>:</span><span class='nv'>modstat</span><span class='o'>)</span></span>
<span></span>
<span><span class='nv'>all_grps_grid_final_res</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 48 × 7</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># Rowwise: </span></span></span>
<span><span class='c'>#&gt;    product type          model_spec dep_vars mod    res              modstat </span></span>
<span><span class='c'>#&gt;    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>         <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>      <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>           <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>  </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 1</span> All     All           base       csat     <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [4 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 2</span> All     All           base       csat_top <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [4 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 3</span> All     All           email      csat     <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [5 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 4</span> All     All           email      csat_top <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [5 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 5</span> All     All           website    csat     <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [5 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 6</span> All     All           website    csat_top <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [5 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 7</span> All     no_reactivate base       csat     <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [4 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 8</span> All     no_reactivate base       csat_top <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [4 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> 9</span> All     no_reactivate email      csat     <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [5 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>10</span> All     no_reactivate email      csat_top <span style='color: #555555;'>&lt;lm&gt;</span>   <span style='color: #555555;'>&lt;tibble [5 × 5]&gt;</span> &lt;tibble&gt;</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with 38 more rows</span></span></span>
<span></span></code></pre>

</div>

Although we are not specifically interested in the results, below is one way to filter out those models that are statistically significant at the 10% level arranged by adjusted r-squared in descending order:

<div class="highlight">

<pre class='chroma'><code class='language-r' data-lang='r'><span><span class='nv'>all_grps_grid_final_res</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://tidyr.tidyverse.org/reference/nest.html'>unnest</a></span><span class='o'>(</span><span class='nv'>modstat</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/select.html'>select</a></span><span class='o'>(</span><span class='o'>-</span><span class='nf'><a href='https://rdrr.io/r/base/c.html'>c</a></span><span class='o'>(</span><span class='nv'>sigma</span>, <span class='nv'>statistic</span>, <span class='nv'>df</span><span class='o'>:</span><span class='nv'>df.residual</span><span class='o'>)</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/filter.html'>filter</a></span><span class='o'>(</span><span class='nv'>p.value</span> <span class='o'>&lt;</span> <span class='m'>0.1</span><span class='o'>)</span> <span class='o'>|&gt;</span></span>
<span>  <span class='nf'><a href='https://dplyr.tidyverse.org/reference/arrange.html'>arrange</a></span><span class='o'>(</span><span class='nf'><a href='https://dplyr.tidyverse.org/reference/desc.html'>desc</a></span><span class='o'>(</span><span class='nv'>adj.r.squared</span><span class='o'>)</span><span class='o'>)</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># A tibble: 4 × 10</span></span></span>
<span><span class='c'>#&gt;   product  type     model…¹ dep_v…² mod   res      r.squ…³ adj.r…⁴ p.value  nobs</span></span>
<span><span class='c'>#&gt;   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>    <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;chr&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;lis&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;list&gt;</span>     <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span>   <span style='color: #555555; font-style: italic;'>&lt;dbl&gt;</span> <span style='color: #555555; font-style: italic;'>&lt;int&gt;</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>1</span> advanced no_reac… base    csat_t… <span style='color: #555555;'>&lt;lm&gt;</span>  &lt;tibble&gt;  0.423   0.279   0.076<span style='text-decoration: underline;'>5</span>    16</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>2</span> advanced All      base    csat_t… <span style='color: #555555;'>&lt;lm&gt;</span>  &lt;tibble&gt;  0.349   0.234   0.057<span style='text-decoration: underline;'>5</span>    21</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>3</span> All      All      email   csat    <span style='color: #555555;'>&lt;lm&gt;</span>  &lt;tibble&gt;  0.112   0.057<span style='text-decoration: underline;'>5</span>  0.097<span style='text-decoration: underline;'>3</span>    70</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>4</span> All      All      base    csat    <span style='color: #555555;'>&lt;lm&gt;</span>  &lt;tibble&gt;  0.088<span style='text-decoration: underline;'>4</span>  0.053<span style='text-decoration: underline;'>8</span>  0.061<span style='text-decoration: underline;'>3</span>    83</span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'># … with abbreviated variable names ¹​model_spec, ²​dep_vars, ³​r.squared,</span></span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'>#   ⁴​adj.r.squared</span></span></span>
<span></span></code></pre>

</div>

## Wrap-up

That's it. This post started out easy and got quite complex in the end. There's certainly room to refine this approach by encapsulating parts of those lengthy pipes in custom functions, but that's a story for another time. For now, I hope you enjoyed this post. If you use other helper functions or have a better approach for calculating many models, I'd love to hear your feedback. Feel free to share your thoughts in the comments below or via Twitter, Mastodon, or GitHub.

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
<span><span class='c'>#&gt;  date     2023-04-03</span></span>
<span><span class='c'>#&gt;  pandoc   2.19.2 @ /Applications/RStudio.app/Contents/MacOS/quarto/bin/tools/ (via rmarkdown)</span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #00BBBB; font-weight: bold;'>─ Packages ───────────────────────────────────────────────────────────────────</span></span></span>
<span><span class='c'>#&gt;  <span style='color: #555555; font-style: italic;'>package     </span> <span style='color: #555555; font-style: italic;'>*</span> <span style='color: #555555; font-style: italic;'>version   </span> <span style='color: #555555; font-style: italic;'>date (UTC)</span> <span style='color: #555555; font-style: italic;'>lib</span> <span style='color: #555555; font-style: italic;'>source</span></span></span>
<span><span class='c'>#&gt;  backports      1.4.1      <span style='color: #555555;'>2021-12-13</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  broom        * 1.0.1      <span style='color: #555555;'>2022-08-29</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  cachem         1.0.6      <span style='color: #555555;'>2021-08-19</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  cli            3.6.0      <span style='color: #555555;'>2023-01-09</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  digest         0.6.31     <span style='color: #555555;'>2022-12-11</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  downlit        0.4.2      <span style='color: #555555;'>2022-07-05</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  dplyover     * <span style='color: #BB00BB; font-weight: bold;'>0.0.8.9002</span> <span style='color: #555555;'>2022-10-15</span> <span style='color: #555555;'>[1]</span> <span style='color: #BB00BB; font-weight: bold;'>Github (timteafan/dplyover@f0cd984)</span></span></span>
<span><span class='c'>#&gt;  dplyr        * 1.1.0      <span style='color: #555555;'>2023-01-29</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  ellipsis       0.3.2      <span style='color: #555555;'>2021-04-29</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  evaluate       0.19       <span style='color: #555555;'>2022-12-13</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  fansi          1.0.3      <span style='color: #555555;'>2022-03-24</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  fastmap        1.1.0      <span style='color: #555555;'>2021-01-25</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  fs             1.5.2      <span style='color: #555555;'>2021-12-08</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  generics       0.1.3      <span style='color: #555555;'>2022-07-05</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  glue           1.6.2      <span style='color: #555555;'>2022-02-24</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  highr          0.10       <span style='color: #555555;'>2022-12-22</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  htmltools      0.5.4      <span style='color: #555555;'>2022-12-07</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  hugodownplus   <span style='color: #BB00BB; font-weight: bold;'>0.0.0.9000</span> <span style='color: #555555;'>2023-02-19</span> <span style='color: #555555;'>[1]</span> <span style='color: #BB00BB; font-weight: bold;'>Github (timteafan/hugodownplus@d79c4c0)</span></span></span>
<span><span class='c'>#&gt;  knitr          1.41       <span style='color: #555555;'>2022-11-18</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  lifecycle      1.0.3      <span style='color: #555555;'>2022-10-07</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  magrittr       2.0.3      <span style='color: #555555;'>2022-03-30</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  memoise        2.0.1      <span style='color: #555555;'>2021-11-26</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  modelsummary * 1.3.0      <span style='color: #555555;'>2023-01-05</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  openxlsx       4.2.5.2    <span style='color: #555555;'>2023-02-06</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  pillar         1.8.1      <span style='color: #555555;'>2022-08-19</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  pkgconfig      2.0.3      <span style='color: #555555;'>2019-09-22</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  purrr        * 1.0.1      <span style='color: #555555;'>2023-01-10</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  R6             2.5.1      <span style='color: #555555;'>2021-08-19</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  Rcpp           1.0.9      <span style='color: #555555;'>2022-07-08</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  rlang        * 1.0.6      <span style='color: #555555;'>2022-09-24</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  rmarkdown      2.19       <span style='color: #555555;'>2022-12-15</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  rstudioapi     0.14       <span style='color: #555555;'>2022-08-22</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  sessioninfo    1.2.2      <span style='color: #555555;'>2021-12-06</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  stringi        1.7.8      <span style='color: #555555;'>2022-07-11</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  stringr        1.5.0      <span style='color: #555555;'>2022-12-02</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  tables         0.9.10     <span style='color: #555555;'>2022-10-17</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  tibble         3.1.8      <span style='color: #555555;'>2022-07-22</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  tidyr        * 1.2.1      <span style='color: #555555;'>2022-09-08</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  tidyselect     1.2.0      <span style='color: #555555;'>2022-10-10</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  utf8           1.2.2      <span style='color: #555555;'>2021-07-24</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  vctrs          0.5.2      <span style='color: #555555;'>2023-01-23</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  withr          2.5.0      <span style='color: #555555;'>2022-03-03</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  xfun           0.36       <span style='color: #555555;'>2022-12-21</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  yaml           2.3.6      <span style='color: #555555;'>2022-10-18</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt;  zip            2.2.2      <span style='color: #555555;'>2022-10-26</span> <span style='color: #555555;'>[1]</span> <span style='color: #555555;'>CRAN (R 4.2.0)</span></span></span>
<span><span class='c'>#&gt; </span></span>
<span><span class='c'>#&gt; <span style='color: #555555;'> [1] /Library/Frameworks/R.framework/Versions/4.2/Resources/library</span></span></span>
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

  function create_output_box(title, content) {
    let summary = document.createElement("summary");
    summary.classList.add("output-header");
    summary.setAttribute("markdown", "1");

    let summary_title = document.createTextNode(title)
    let summary_icon = document.createElement('i');
    summary_icon.classList.add("fas", "fa-laptop-code");
    summary.append(summary_title, summary_icon);

    let div_output_details = document.createElement("div");
    div_output_details.classList.add('output-details');
    div_output_details.append(...content)

    let details = document.createElement('details');
    details.append(summary, div_output_details);

    let div_output = document.createElement("div");
    div_output.classList.add('output');
    div_output.setAttribute("markdown", "1");
    div_output.append(details);
    return(div_output)
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

  function output_box() {
    let childs = document.querySelectorAll("div.output-box");
    childs.forEach(el => {
      let title = el.title
      let output_box = create_output_box(title, el.childNodes);
      el.append(output_box)
    });
  };

 function load_boxes() {
     info_box();
     warn_box();
     output_box();
   }

  window.onload = load_boxes();
</script>

