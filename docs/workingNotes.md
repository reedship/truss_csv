# Requirements

- [ ] The entire CSV is in the UTF-8 character set.\*
- [x] The Timestamp column should be formatted in RFC3339 format.
- [x] The Timestamp column should be assumed to be in US/Pacific time; please convert it to US/Eastern.
- [x] All ZIP codes should be formatted as 5 digits. If there are less than 5 digits, assume 0 as the prefix.
- [x] The FullName column should be converted to uppercase. There will be non-English names.
- [x] The Address column should be passed through as is, except for Unicode validation. Please note there are commas in the Address field; your CSV parsing will need to take that into account. Commas will only be present inside a quoted string.
- [x] The FooDuration and BarDuration columns are in HH:MM:SS.MS format (where MS is milliseconds); please convert them to the total number of seconds.
- [x] The TotalDuration column is filled with garbage data. For each row, please replace the value of TotalDuration with the sum of FooDuration and BarDuration.
- [ ] The Notes column is free form text input by end-users; please do not perform any transformations on this column. If there are invalid UTF-8 characters, please replace them with the Unicode Replacement Character.\*

## Issues with UTF-8 in this submission.

I had some issues with UTF-8 encoding while working on this. Most of my experience in encoding has been in Ruby/Ruby on Rails and in order to validate utf-8 and replace with the Unicode Replacement Character you would do something like the following:
```ruby
# ...code for reading line from csv above
line.encode!('UTF-8', :invalid => :replace, :replace => "\ufffd")
# ...code for skipping/pushing data from line below
```

This is a very simple way of doing this, and when I attempted to find a way to do this in Typescript, I ran into a lot of issues that ate into the four hour time limit. Some examples of what I found but couldn't get to work:
```typescript
try {
    // Try to convert to utf-8
    utf8Text = decodeURIComponent(escape(text));
    // If the conversion succeeds, text is not utf-8
} catch(e) {
    console.log(e.message); // URI malformed
}
```

However `escape` and `unescape` are deprecated and are no longer supported, so I figure this wouldn't be a good solution.

I thought that converting to and from a `Buffer` might be a way to validate, but I couldn't get this to validate rows in the `sample.csv` that were apparently correctly encoded.
```typescript
let str: string  = 'your string here';
let buff: Buffer = Buffer.from(str, 'utf8');
let newStr: string = buff.toString('utf8');
```
I also ran into a weird issue where when I checked the content of `sample-with-broken-utf8.csv` using third party tools or the ruby snippet above to validate the UTF-8 encoding, I couldn't find any tools that said the encoding was invalid. I am not sure if this is intentional or a bug, or just my own incompetence, but it was strange and ate up some time.

As I had spent over an hour messing with UTF-8 I figured I was eating into time I would need to wrap up the project and get it in a suitable enough condition for handoff. I'm disappointed I couldn't get this portion of the requirements working but in a real world situation this is where I would reach out to other people who are more familiar with encodings and how messy they can get.  ¯\\\_(ツ)\_/¯

This definitely isn't my area of expertise and I'd need to reach out to peers to get this part running without spending wayyyy too long on it.

## What I would do if I had more time

- Getting UTF-8 encoding working correctly.
- Validation didn't end up getting done in the way I would have liked. `fast-csv` skips rows that error out in some way anyway currently, so while this isn't super explicit it's giving the intended result. I don't think it's fair to rely on a side effect of a third-party libraries code, so this isn't a long term solution.
- Organize code into a more maintainable layout, outside of just using `index.ts` to hold 99% of the logic.
- Read CLI arguments from STDIN as well.
- Pack program into an executable so it can be a real CLI.
