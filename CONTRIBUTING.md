# How to contribute

Thank you for your interest and for reading this. We would love to see this project growing and getting more robust with developers contributions.


Here are some important resources:

  * [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)Tells you the process we use,
  * [SPICE](https://naif.jpl.nasa.gov/naif/data.html) is the underlying application that we leverage


## The process

Hypothetically, you find an issue or opportunity for improvement :wink:. What do you do next?   

- Open a pull request for new file contributions or significant changes.
- If you've got a small editorial change or suggestion, please feel free to create an Issue.
- In either case, your input will receive a reply within a few days, and we'll usually have a discussion using comments in order to refine your suggestion.

## Submitting changes

1. If there is no ticket associated to your change, please create one [here](https://github.com/NASA-AMMOS/timecraft/issues).
2. Work on your changes. We ask you to follow standard coding conventions (noted below).
3. Commit often, and describe your changes. IT WILL HELP FOR THE CODE REVIEW. Make sure all of your commits are atomic (one feature per commit)
3. Please send a [GitHub Pull Request](https://github.com/NASA-AMMOS/timecraftjs/pulls) with a clear list of what you've done (read more about [pull requests](http://help.github.com/pull-requests/)). When you send a pull request, we will love you forever if you include examples. We can always use more test coverage.

Always write a clear log message for your commits. One-line messages are fine for small changes, but bigger changes should look like this:

    $ git commit -m "A brief summary of the commit
    >
    > A paragraph describing what changed and its impact."

## Coding conventions

Start reading our code and you'll get the hang of it. We optimize for readability:

  * We indent using four spaces
  * We ALWAYS put spaces after list items and method parameters (`[1, 2, 3]`, not `[1,2,3]`), around operators (`x += 1`, not `x+=1`), and around hash arrows.
  * This is open source software. Consider the people who will read your code, and make it look nice for them.
  * Always end a simple statement with a semicolon.
