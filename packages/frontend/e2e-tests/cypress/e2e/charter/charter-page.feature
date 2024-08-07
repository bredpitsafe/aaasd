Feature: e2e tests: "Charter" page test suit. I as User checks the functionality of charts on the "Charter" page

  Scenario Outline: Checking the visibility of "<GraphName>" graph on the "Charter" page
    Given user goes to the "Charter" page with a "<GraphName>" graph
    And user checks the "<GraphName>" graph

    Examples:
      | GraphName                                                   |
      | All in one                                                  |
      | Auto scale for points out of viewport                       |
      | Bind to right Y axis grid                                   |
      | Day scale                                                   |
      | Day scale with midnight                                     |
      | Display zero point                                          |
      | Dots charts                                                 |
      | Dots with dynamic Size and Color                            |
      | Fixed Min Max                                               |
      | Lines and stairs points out of viewport                     |
      | Lines and stairs points out of viewport and different parts |
      | Lines and stairs points out of viewport with single point   |
      | Lines with dynamic Size and Color                           |
      | Min Max                                                     |
      | Min Max special case when maxY is less then chart min       |
      | Min Max special case when minY is greater then chart max    |
      | Minute scale                                                |
      | Minute scale with midnight                                  |
      | Month scale                                                 |
      | Parts connection                                            |
      | Points selection multiple                                   |
      | Points selection multiple NaN                               |
      | Points selection multiple spaces                            |
      | Points selection single                                     |
      | Points selection single NaN                                 |
      | Points selection single spaces                              |
      | Points with dynamic Size and Color                          |
      | Vertical crosshair                                          |
      | Vertical and horizontal crosshair                           |
      | Second scale                                                |
      | Single Herringbone                                          |
      | Stairs short at part connection                             |
      | Stairs short lines                                          |
      | Steps with dynamic Size and Color                           |
      | Thick line self overlap with opacity                        |
      | Thick lines and points with opacity                         |
      | Thick lines intersection with opacity                       |
      | Closest Points                                              |
