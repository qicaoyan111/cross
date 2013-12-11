// ******* Deep Copy ******** //
$axure.internal(function($ax) {
    // TODO: [ben] Ah, infinite loops cause major issues here. Tried saving objects we've already hit, but that didn't seem to work (at least at my first shot).
    var _deepCopy = function(original, trackCopies) {
        if(trackCopies && _originalToCopy[original]) return _originalToCopy[original];
        var copy = original;
        if(original instanceof Array) copy = deepCopyArray(original, trackCopies);
        else if(!(original instanceof Function) && (original instanceof Object)) copy = deepCopyObject(original, trackCopies);
        if(trackCopies) _originalToCopy[original] = copy;
        return copy;
    };
    $ax.deepCopy = _deepCopy;

    // Hacky way to copy event info. Copying dragInfo causes major issues due to infinite loops
    var _originalToCopy = {};
    $ax.eventCopy = function(eventInfo) {
        var dragInfo = eventInfo.dragInfo;
        if(!dragInfo) return _deepCopy(eventInfo, true);

        delete eventInfo.dragInfo;
        var copy = _deepCopy(eventInfo, true);
        copy.dragInfo = dragInfo;
        eventInfo.dragInfo = dragInfo;
        // reset the map.
        _originalToCopy = {};

        return copy;
    };

    var deepCopyArray = function(original, trackCopies) {
        var copy = [];
        for(var i = 0; i < original.length; i++) {
            copy[i] = _deepCopy(original[i], trackCopies);
        }
        return copy;
    };

    var deepCopyObject = function(original, trackCopies) {
        var copy = {};
        for(var key in original) {
            if(!original.hasOwnProperty(key)) continue;
            copy[key] = _deepCopy(original[key], trackCopies);
        }
        return copy;
    };

    // Our implementation of splice because it is broken in IE8...
    $ax.splice = function(array, startIndex, count) {
        var retval = [];
        if(startIndex >= array.length || startIndex < 0) return retval;
        if(!count || startIndex + count > array.length) count = array.length - startIndex;
        for(var i = 0; i < count; i++) retval[i] = array[startIndex + i];
        for(i = startIndex + count; i < array.length; i++) array[i - count] = array[i];
        for(i = 0; i < count; i++) array.pop();
        return retval;
    };
});



// ******* Flow Shape Links ******** //
$axure.internal(function($ax) {

    if(!$ax.document.configuration.linkFlowsToPages && !$ax.document.configuration.linkFlowsToPagesNewWindow) return;

    $(window.document).ready(function() {
        $ax(function(dObj) { return dObj.type == 'flowShape' && dObj.referencePageUrl; }).each(function(dObj, elementId) {

            var elementIdQuery = $('#' + elementId);

            if($ax.document.configuration.linkFlowsToPages) {
                elementIdQuery.css("cursor", "pointer");
                elementIdQuery.click(function() {
                    $ax.navigate({
                        url: dObj.referencePageUrl,
                        target: "current",
                        includeVariables: true
                    });
                });
            }

            if($ax.document.configuration.linkFlowsToPagesNewWindow) {
                $('#' + elementId + "_ref").append("<div id='" + elementId + "PagePopup' class='refpageimage'></div>");
                $('#' + elementId + "PagePopup").click(function() {
                    $ax.navigate({
                        url: dObj.referencePageUrl,
                        target: "new",
                        includeVariables: true
                    });
                });
            }
        });
    });

});
