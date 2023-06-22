var UHTLogotypeInfo = {
	"ext_test3": {
		"src": "oneworks_logo.png",
		"bg": "#000000",
		"fit": "shrink"
	},
	"oneworks": {
		"src": "oneworks_logo.png",
		"bg": "#000000",
		"fit": "shrink"
	},
	"ow_cash": {
		"src": "oneworks_logo.png",
		"bg": "#000000",
		"fit": "shrink"
	}
};

var UHTLobbySeparateIcons = {
	"zh": "_zh/",
	"zt": "_zh/"
}

UHT_ForceClickForSounds = true;
UHT_STILLCHECKMONEYONSPIN = true;

var ST_GA4 = ["G-LM078XY385", "G-CZW3H3GKFN", "G-GH2SZPZ0GS", "G-BBX3GJ2LDP", "G-KMZJZBH10S", "G-GM5RY6Z8LG", "G-K2E2CD7X5Y", "G-TYR41R01EW", "G-8QQNGJE2DS",
	"G-EPVHT9CLQ4", "G-VFTT2CT4CR", "G-GS4CT46LFL", "G-DGFCQDPGWL", "G-Y7K30WC0F6", "G-QVNYQ57KXJ", "G-JSPY03SG9K", "G-YE4DLTEP1H", "G-0JL903JZ68", "G-695Z6D75L3",
	"G-Z7YN4ZH32L", "G-L81RWHNFKF", "G-X8XBXYELJP", "G-YZ36FT3P2N", "G-EN4F8844JM", "G-EXLTZWNLW9", "G-0E2CEPJ3G7", "G-Z8RSQ2SX6H", "G-ML7K1SQ4N7", "G-D15D7PY7B4",
	"G-P6DSTCLEM6", "G-C49NYG0QJY", "G-HCR8HL08ZF"
];

var SPIN_TRACKER_ID = Math.floor(Math.random() * 32);
if (window["ga4_init"] != undefined)
	ga4_init('UA-83294317-' + (7 + SPIN_TRACKER_ID), {
		'siteSpeedSampleRate': 10,
		'sampleRate': 1,
		name: "ST" + SPIN_TRACKER_ID
	}, ST_GA4[SPIN_TRACKER_ID]);
else
	ga('create', 'UA-83294317-' + (7 + SPIN_TRACKER_ID), {
		'siteSpeedSampleRate': 10,
		'sampleRate': 1,
		name: "ST" + SPIN_TRACKER_ID
	});


function UHTPatch(info) // {name, ready(), apply(), interval}
{
	if (info["_UHT_timer"] != undefined)
		clearTimeout(info["_UHT_timer"]);
	if (info.ready())
		info.apply();
	else
		if (info.retry())
			info["_UHT_timer"] = setTimeout(function () {
				UHTPatch(info)
			}, info.interval || 500);
}

UHTPatch({
	name: "PatchJurisdictionRequirementsOnGP16",
	ready: function () {
		return (window["VideoSlotsConnectionXTLayer"] != undefined && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply: function () {
		if (location.hostname.indexOf(".gp16.") == -1)
			return;

		if (location.host.indexOf("test1.gp16") == -1 && location.host.indexOf("test2.gp16") == -1)
			return;

		var url = window.location.href;
		var data = null;
		if (url.indexOf("brandName") != -1) {
			var params = url.split("&");
			for (var i = 0; i < params.length; i++) {
				if (params[i].indexOf("brandName") == 0) {
					data = params[i].split("=")[1];
				}
			}
		} else
			return;

		window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements += "," + data;
		var unused = IsRequired("UNUSED");
		var oVSCXTL_RS = VideoSlotsConnectionXTLayer.prototype.RequirementsSetup;
		VideoSlotsConnectionXTLayer.prototype.RequirementsSetup = function () {
			ServerOptions.brandRequirements += "," + data;
			var unused = IsRequired("UNUSED", false, true);
			oVSCXTL_RS.apply(this, arguments);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchMultiLobbyConnection_140824",
	ready: function () {
		return (window["MultiLobbyConnection"] != undefined);
	},
	apply: function () {
		MultiLobbyConnection.prototype.UpdateCategoryLists = function ( /**LobbyCategory*/ category, /**boolean*/ updateTextures) {
			var games = category.games;
			if (games == null)
				return;

			var gamesLand = games;
			var gamesPort = games;

			if (category.symbol == MultiLobbyCategorySymbol.LandingPage && category != this.searchCategory) {
				gamesLand = category.gamesLand;
				gamesPort = category.gamesPort;
			}

			var listLand = category.listLandscape = [];
			var listPort = category.listPortrait = [];

			var listL = null;
			var listP = null;

			var textures = updateTextures ? this.GetTextures(this.textureSuffix) : null;
			for (var j = 0; j < games.length; ++j) {
				var game = games[j];

				if (updateTextures)
					this.UpdateTexture(textures, game);

				var idxL = j % this.gamesPerLineLandscape;
				var idxP = j % this.gamesPerLinePortrait;

				if (idxL == 0) {
					if (listL != null)
						listLand.push(listL);

					listL = [];
				}

				if (idxP == 0) {
					if (listP != null)
						listPort.push(listP);

					listP = [];
				}

				listL.push(gamesLand[j]);
				listP.push(gamesPort[j]);
			}

			if (listL != null)
				listLand.push(listL);

			if (listP != null)
				listPort.push(listP);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentLeaderboardItem_140772",
	ready: function () {
		return (window["TournamentLeaderboardItem"] != undefined);
	},
	apply: function () {
		TournamentLeaderboardItem.prototype.UpdateValue = function ( /**TournamentProtocol.LeaderboardItem*/ lbi) {
			this.gameObject.SetActive(lbi != null);

			if (lbi == null)
				return;

			var isYou = lbi.isPlayer;
			var color = isYou ? this.colorYou : this.colorNotYou;

			this.placeLabel.text = String(lbi.position);
			this.scoreLabel.text = PromotionsHelper.FormatScore(lbi.score, lbi.leaderboard);
			this.playerLabel.text = isYou ? this.localizedYouLabel.text : String(lbi.playerID);

			if (this.useColor) {
				this.placeLabel.SetColor(color);
				this.scoreLabel.SetColor(color);
				this.playerLabel.SetColor(color);
			}

			if (this.oddContents != null)
				this.oddContents.SetActive(this.valueIdx % 2 == 1);

			if (this.youContent != null)
				this.youContent.SetActive(isYou);

			if (isYou) {
				if (this.capitalizeYou)
					this.playerLabel.text = this.playerLabel.text.toUpperCase();

				if (this.formatYou)
					this.playerLabel.text = this.youFormat.replace("{0}", this.playerLabel.text);
			} else if (this.replaceAsterisksInPlayerID)
				this.playerLabel.text = this.playerLabel.text.replace(/\*/g, this.playerIDAsteriskReplacement);

			if (this.countryFlag != null) {
				if (this.playerWidth < 0) {
					this.scoreWidth = this.scoreLabel.width;
					this.playerWidth = this.playerLabel.width;
					this.playerLocalPos = this.playerLabel.transform.localPosition();
				}

				var hasFlag = !_string.IsNullOrEmpty(lbi.countryID);
				var playerOffset = new UHTMath.Vector3(hasFlag ? this.countryFlagPlayerOffset : 0, 0, 0);

				this.playerLabel.width = this.playerWidth - playerOffset.x;
				this.playerLabel.transform.localPosition(UHTMath.Vector3.add(this.playerLocalPos, playerOffset));

				this.countryFlag.gameObject.SetActive(hasFlag);
				if (hasFlag) {
					var countryID = lbi.countryID;

					var data = this.countryFlag.atlas.getTextureInfoForSprite(this.countryFlag, countryID);
					if (data == null || countryID == "ph")
						countryID = TournamentLeaderboardItem.defaultCountryID;

					this.countryFlag.SetSpriteNameForAnimation(countryID);
				}

				if (this.countryFlagPlayerLabel != null) {
					this.CountryFlagAdjustPlayerScoreWidths(hasFlag);

					this.countryFlagPlayerLabel.text = this.playerLabel.text;
					this.countryFlagPlayerLabel.SetColor(this.playerLabel.GetColor());

					this.playerLabel.gameObject.SetActive(!hasFlag);
					this.countryFlagPlayerLabel.gameObject.SetActive(hasFlag);
				}
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchBetLevelManagerNOAB",
	ready: function () {
		return (window["BetLevelManager"] != undefined);
	},
	apply: function () {
		BetLevelManager.prototype.OnBetLevelSettings = function (blSettings) {
			this.betLevelSettings = blSettings;

			if ((!this.isSuperSpin && XT.GetBool(Vars.Jurisdiction_DisableAnteBet)) ||
				(this.isSuperSpin && XT.GetBool(Vars.Jurisdiction_DisableSuperSpin))) {
				this.SetBetLevel("0");
				this.betLevelSettings = null;
			}

			if (this.betLevelSettings == null) {
				XT.UnregisterCallbackEvent(this.OnGameInit, this);
				XT.UnregisterCallbackObject(this.OnBetLevelSettings, this);
				Globals.SetLayerRecursively(this.gameObject, 0);
				this.xtEnabled = false;
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchHideJackpotPlaySeedAndContribution",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (IsRequired("NOJPC")) {
			var paths = [
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P1_2",
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P1_3",
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P7_3",
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P7_4",

				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P1_2",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P1_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot3/Content/RealContent/P7_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot3/Content/RealContent/P7_4",

				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P1_2",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P1_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot2/Content/RealContent/P7_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot3/Content/RealContent/P7_4"
			];

			for (var i = 0; i < paths.length; i++) {
				var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
				if (t != null) {
					t.localScale(0, 0, 0);
				}
			}

			var pathsForMoving = [
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P1_4", 100],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P2", 80],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P4", 60],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P7", 40],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P7_1", 20],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/TitleHolder2", 300],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P1", 260],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P2", 220],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P2_1", 180],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P3", 140],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P4", 100],

				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P1_4", 100],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P2", 80],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot2/Content/RealContent/P4", 60],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot2/Content/RealContent/P7", 40],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot2/Content/RealContent/P7_1", 20],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/TitleHolder2", 300],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P1", 260],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P2", 220],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P2_1", 180],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P3", 120],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P4", 60],

				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P1_4", 200],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P2", 100],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P4", 0],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot2/Content/RealContent/P7", -100],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot2/Content/RealContent/P7_1", -200],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot3/Content/RealContent/TitleHolder2", 650],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P1", 450],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P2", 300],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P2_1", 150],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P3", 50],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P4", 0],
			];

			for (var i = 0; i < pathsForMoving.length; i++) {
				var t = globalRuntime.sceneRoots[1].transform.Find(pathsForMoving[i][0]);
				if (t != null) {
					var pos = t.localPosition();
					t.localPosition(pos.x, pos.y + pathsForMoving[i][1], pos.z);
				}
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchDisableSTILLCHECKMONEYONSPIN",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply: function () {
		if (IsRequired("DMC")) {
			UHT_STILLCHECKMONEYONSPIN = false;
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPromotionsAnnouncer_137889",
	ready: function () {
		return (window["PromotionsAnnouncer"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (Globals.isMini) {
			var pa = globalRuntime.sceneRoots[1].GetComponentsInChildren(PromotionsAnnouncer, true);
			for (var i = 0; i < pa.length; i++) {
				var lp = pa[i].transform.localPosition();
				pa[i].transform.localPosition(lp.x, lp.y, -320);
			}

		}
	},
	retry: function () {
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	}
});

UHTPatch({
	name: "PatchNoJackpotTooltip",
	ready: function () {
		return (window["JackpotVisualMystery"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (IsRequired("NOJPT")) {
			if (window["UHT_GAME_CONFIG"]["GAME_SYMBOL"].indexOf("vsprg") == 0) {
				this.HideOnGameInit = function () {
					var jvm = globalRuntime.sceneRoots[1].GetComponentsInChildren(JackpotVisualMystery, true);
					for (var i = 0; i < jvm.length; i++) {
						var colliders = jvm[i].GetComponentsInChildren(Collider, true);
						for (var j = 0; j < colliders.length; j++) {
							colliders[j].enabled = false;
						}
					}
				};

				XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.HideOnGameInit, this);
			}
		}
	},
	retry: function () {
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	}
});

UHTPatch({
	name: "PatchSpaceAndEnter",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UILabel"] != undefined);
	},
	apply: function () {
		if (IsRequired("NOST")) {
			var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
			var labelsToHide = [];
			for (var i = 0; i < labels.length; i++) {
				if (labels[i].text.indexOf("SPACE and ENTER buttons on the keyboard can be used to start and stop") != -1)
					labelsToHide.push(labels[i].gameObject);
			}

			this.HideOnGameInit = function () {
				for (var i = 0; i < labelsToHide.length; i++) {
					labelsToHide[i].SetActive(false);
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.HideOnGameInit, this);
		}
	},
	retry: function () {
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	},
	interval: 50
});

UHTPatch({
	name: "Patch_134875",
	ready: function () {
		return (window["TournamentRule"] != undefined);
	},
	apply: function () {
		TournamentRule.prototype.SplitWords = function (res, words, paragraphIdx) {
			var text = "";
			var labelTxt = "";

			for (var i = 0; i < words.length; ++i) {
				labelTxt = this.sampleLabel.text;
				this.sampleLabel.text = words[i];

				if (this.sampleLabel.GetWidth() <= this.maxLabelWidth) {
					this.sampleLabel.text = labelTxt + words[i];
					if (this.sampleLabel.GetWidth() <= this.maxLabelWidth) {
						text = this.sampleLabel.text;
						this.sampleLabel.text += " ";
					} else {
						res.push(text);
						if (res.length >= this.maxNumberOfLines) {
							this.StopAt(null, 0, words, i, paragraphIdx);
							return;
						}

						this.sampleLabel.text = "";
						text = "";
						i--;
					}
				} else if (words[i].indexOf("\u00A0") != -1) {
					var processedWords = words[i].replace(/\u00A0/g, " ").split(' ');
					words.splice(i, 1);
					_array.InsertRange(words, i, processedWords);
					i--;
				} else {
					this.sampleLabel.text = labelTxt;
					text = "";
					this.SplitChars(res, text, words[i], paragraphIdx, words, i);

					if (this.isStopped)
						return;
				}
			}

			if (text != "") {
				res.push(text);
				if (res.length >= this.maxNumberOfLines)
					this.StopAt(null, 0, null, 0, paragraphIdx);
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFreeRoundsBonusConnection",
	ready: function () {
		return (window["FreeRoundsBonusConnection"] != undefined);
	},
	apply: function () {
		FreeRoundsBonusConnection.prototype.ParseFreeRoundData = function ( /** ? */ data) {
			if (XT.GetObject(Vars.BonusRoundsEvents) != null && XT.GetObject(Vars.BonusRoundsEvents).length > 0)
				return;

			var brData = new VsFreeRound();
			var brEvents = new VsFreeRoundEvent();

			brEvents.PromoType = (data["promoType"] != null) ? data["promoType"] : "";
			brData.Type = VsFreeRound.RoundType.Spins;
			var type = data["freeRoundsType"];
			switch (type) {
				case "N":
					brData.Type = VsFreeRound.RoundType.Spins;
					break;
				case "T":
					brData.Type = VsFreeRound.RoundType.Timed;
					break;
				case "F":
					brData.Type = VsFreeRound.RoundType.BonusBoost;
					break;
				default:
					break;
			}
			brData.RoundsLeft = _number.otoi(data["freeRoundsNumber"]);
			brEvents.RoundsLeft = _number.otoi(data["freeRoundsNumber"]);
			brEvents.Bet = _number.otod(data["betPerLine"]);
			brEvents.Lines = _number.otoi(data["numberOfLines"]);
			brEvents.TurboSpinMode = _bool.Parse(data["turboSpinMode"]);
			brEvents.PlayLaterAvailable = _bool.Parse(data["playLaterAvailable"]);
			brEvents.EndDateTimestamp = _number.otod(data["expirationDate"]);
			brEvents.IsFreeRoundPending = _bool.Parse(data["freeRoundPending"]);
			brEvents.PromoLocalizedName = (data["promoLocalizedName"] != null) ? data["promoLocalizedName"] : "";
			brEvents.Type = VsFreeRoundEvent.EventType.Start;

			this.cachedInitBonusCode = data["bonusCode"];

			var events = [];
			events.push(brEvents);

			XT.SetObject(Vars.BonusRoundsData, brData);
			XT.SetObject(Vars.BonusRoundsEvents, events);
			this.shouldUpdatePlayLater = false;
			XT.SetBool(Vars.UserChoseToPlayLater, false);
			XT.TriggerEvent(Vars.Evt_Internal_BonusRoundsInfoUpdated);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	// changes
	// "FREE PROMOTION, NO ADDITIONAL COST TO PARTICIPATE AND NO OPTION TO OPT-IN LATER.\r\n\r\nARE YOU SURE YOU WANT TO OPT OUT?"
	// to
	// "THERE IS NO ADDITIONAL COST TO PARTICIPATE AND NO OPTION TO OPT-IN LATER.\r\n\r\nARE YOU SURE YOU WANT TO OPT OUT?"

	name: "PatchPromoOptOut",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (UHT_GAME_CONFIG_SRC.lang != "en")
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/LocalizedLabelsEU/FreeConfirmOptOutLabel",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/TournamentArrangeable/Tournament/LocalizedLabelsEU/FreeConfirmOptOutLabel",
		];

		for (var i = 0; i < paths.length; i++) {
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null) {
				var l = t.gameObject.GetComponent(UILabel);
				l.text = "THERE IS NO ADDITIONAL COST TO PARTICIPATE AND NO OPTION TO OPT-IN LATER.\r\n\r\nARE YOU SURE YOU WANT TO OPT OUT?";
			}
		}
	},
	retry: function () {
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	},
});



UHTPatch({
	name: "PatchDeRTP",
	ready: function () {
		return (window["JurisdictionShowOdds"] != undefined);
	},
	apply: function () {
		if (!IsRequired("SHOEXC"))
			return;

		var oJSO_HIR = JurisdictionShowOdds.prototype.HandleInitResponse;
		var PatchDeRTP_labels = [];
		JurisdictionShowOdds.prototype.HandleInitResponse = function () {
			oJSO_HIR.apply(this, arguments);
			PatchDeRTP_labels.push(this.chanceLabel);
		};

		var oSI_ICOS = StageInit.prototype.OnIntroClosedOrSkipped;
		StageInit.prototype.OnIntroClosedOrSkipped = function () {
			oSI_ICOS.apply(this, arguments);

			var isMobile = false;
			var paytables = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
			if (paytables.length == 0) {
				paytables = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);
				isMobile = true;
			}
			var paytable = paytables[0];
			XT.TriggerEvent(Vars.Evt_Internal_PaytableOpen);
			var pageFlippers = [];
			if (isMobile) {
				pageFlippers = globalRuntime.sceneRoots[1].GetComponentsInChildren(PageFlipper, true);
				for (var i = 0; i < pageFlippers.length; i++) {
					pageFlippers[i].savedActiveState = pageFlippers[i].gameObject.activeInHierarchy;
					pageFlippers[i].gameObject.SetActive(true);
				}
			}

			var initialPage = -69;
			if (!isMobile)
				initialPage = paytable.pageIdx;

			var minRTPVarD = [];
			var minRTPValD = [];

			var RTPs = [];

			var RTPVarD = [];

			var allVarD = globalRuntime.sceneRoots[1].GetComponentsInChildren(VarDisplayer, true);
			for (var i = 0; i < allVarD.length; i++) {
				var name = allVarD[i].variable.name;
				if (name == "ReturnToPlayer" ||
					name == "ReturnToPlayerMin" ||
					name == "ReturnToPlayerWithJackpot" ||
					name == "ReturnToPlayerMinWithJackpot")
					RTPVarD.push(allVarD[i]);
				minRTPVarD.push(name == "ReturnToPlayerMin");
			}

			var RTPValD = [];

			var allValD = globalRuntime.sceneRoots[1].GetComponentsInChildren(ValueDisplayer, true);
			for (var i = 0; i < allValD.length; i++) {
				var name = allValD[i].vdVariable.variable.name;
				if (name == "ReturnToPlayer" ||
					name == "ReturnToPlayerMin" ||
					name == "ReturnToPlayerWithJackpot" ||
					name == "ReturnToPlayerMinWithJackpot")
					RTPValD.push(allValD[i]);
				minRTPValD.push(name == "ReturnToPlayerMin");
			}


			do {
				var avtt = paytable.GetComponentsInChildren(AddVariablesToText, false);

				for (var i = 0; i < avtt.length; i++)
					for (var j = 0; j < avtt[i].someVariables.length; j++) {
						var variable = avtt[i].someVariables[j];
						var name = variable.variable.name;
						if (name == "ReturnToPlayer" ||
							name == "ReturnToPlayerMin" ||
							name == "ReturnToPlayerWithJackpot" ||
							name == "ReturnToPlayerMinWithJackpot") {
							if (name == "ReturnToPlayerMin") {
								avtt[i].baseLabel.gameObject.SetActive(false);
								Globals.SetLayerRecursively(avtt[i].baseLabel.gameObject, 0);
								avtt[i].baseLabel.text = " ";
							} else
								RTPs.push(XT.GetDouble(name));
						}
						if (variable.gameInfo_Name == "rtps") {
							var gameInfo = XT.GetObject("GameInfo");
							if ((gameInfo != undefined) && (gameInfo[variable.gameInfo_Name] != undefined) && (gameInfo[variable.gameInfo_Name][variable.gameInfo_Key] != undefined)) {
								var currentRTP = XT.GetObject("GameInfo")[variable.gameInfo_Name][variable.gameInfo_Key];
								if (currentRTP != undefined)
									RTPs.push(currentRTP);
							}
						}
					}

				var lbl = paytable.GetComponentsInChildren(UILabel, false);
				for (var i = 0; i < lbl.length; i++) {
					for (var j = 0; j < RTPVarD.length; j++)
						if (lbl[i] == RTPVarD[j].label)
							if (minRTPVarD[j])
								Globals.SetLayerRecursively(lbl[i].gameObject, 0);
							else
								RTPs.push(XT.GetDouble(RTPVarD[j].variable.name));
					for (var j = 0; j < RTPValD.length; j++)
						if (lbl[i] == RTPValD[j].label)
							if (minRTPValD[j])
								Globals.SetLayerRecursively(lbl[i].gameObject, 0);
							else
								RTPs.push(XT.GetDouble(RTPValD[j].vdVariable.variable.name));
				}
				if (!isMobile)
					paytable.OnPressedPaytableNext();
			}
			while (!isMobile && (paytable.pageIdx != initialPage))
			XT.TriggerEvent(Vars.Evt_Internal_PaytableClose);

			if (isMobile) {
				for (var i = 0; i < pageFlippers.length; i++) {
					pageFlippers[i].gameObject.SetActive(pageFlippers[i].savedActiveState);
					delete pageFlippers[i].savedActiveState;
				}
			}

			if (RTPs.length > 0) {
				var sum = 0;
				for (var i = 0; i < RTPs.length; i++)
					sum += _number.otod(RTPs[i]);

				var avg = sum / RTPs.length;
				avg = (avg * 100) | 0;
				avg /= 100;

				for (var i = 0; i < PatchDeRTP_labels.length; i++) {
					PatchDeRTP_labels[i].text += " RTP: " + avg + "%";
					PatchDeRTP_labels[i].init();
				}
			}

			if (!isMobile) {
				var JSOs = globalRuntime.sceneRoots[1].GetComponentsInChildren(JurisdictionShowOdds, true);
				if (JSOs.length > 0) {
					var jso = JSOs[0];
					jso.chanceLabel.width = 600;
					jso.chanceLabel.height = 100;
					jso.chanceLabel.gameObject.transform.localPosition(0, 5, 0);
					jso.chanceLabel.init();
					var uis = jso.GetComponentsInChildren(UISprite, true)[0];
					uis.gameObject.transform.localPosition(0, 5, 0);
					uis.gameObject.transform.SetAllDirtyUserFlags();
					uis.width = 480;
				}
			}
		};

	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});



UHTPatch({
	name: "PatchFRBAvailableFor",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (!IsRequired("NOFRBA"))
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts/EndDate",

			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts/EndDate",

			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts/EndDate"
		];

		for (var i = 0; i < paths.length; i++) {
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null) {
				t.localScale(0, 0, 0);
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchGameChangeEvent",
	ready: function () {
		return (window["LobbyGameButton"] != undefined);
	},
	apply: function () {
		var oLGB_SG = LobbyGameButton.prototype.StartGame;
		LobbyGameButton.prototype.StartGame = function (gameData) {
			if (UHTInterfaceBOSS.enabled) {
				var gameSymbol = gameData.symbol;
				if (gameSymbol == "")
					gameSymbol = gameData.uid;

				var args = {
					event: "gameChange",
					params: {
						gameCode: gameSymbol
					}
				};

				UHTInterfaceBOSS.PostMessageRec(window.parent, args);
			}
			oLGB_SG.apply(this, arguments);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPP28465",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		this.OnXTGameInit = function () {
			if (!Globals.isMobile) {
				var pathsDesktop = [
					"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/Utils/PromotionDisplayerLeft",
					"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/Utils/PromotionDisplayerRight"
				];

				for (var i = 0; i < pathsDesktop.length; i++) {
					var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
					if (t != null) {
						var pcs = t.GetComponent(PromotionContentSwitcher);
						if (pcs != null) {
							pcs.switchesByType = false;
							pcs.switchesByStyle = false;
						}
					}
				}
			} else if (!Globals.isMini) {
				var pathsMobile = [
					"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/Utils/PromotionDisplayerLeft",
					"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/Utils/PromotionDisplayerRight",
					"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/Utils/PromotionDisplayerCombined"
				];

				for (var i = 0; i < pathsMobile.length; i++) {
					var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobile[i]);
					if (t != null) {
						var pcs = t.GetComponent(PromotionContentSwitcher);
						if (pcs != null) {
							pcs.switchesByType = false;
							pcs.switchesByStyle = false;
						}
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);

	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchTranslation",
	ready: function () {
		return (window["ModificationsManager"] != undefined);
	},
	apply: function () {
		if (window["UHT_CONFIG"].LANGUAGE == "hy") {
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function (copyFrom, copyTo, alsoCopyText, copyEffects) {
				if (copyFrom.text.toLowerCase() == 'ծահում')
					copyFrom.text = 'ՇԱՀՈՒՄ';
				MMCFLTL.apply(this, arguments);
			};
		}
		if (window["UHT_CONFIG"].LANGUAGE == "ar") {
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function (copyFrom, copyTo, alsoCopyText, copyEffects) {
				copyFrom.text = copyFrom.text.replaceAll(':', ' ');
				MMCFLTL.apply(this, arguments);
			};
		}
		if (window["UHT_CONFIG"].LANGUAGE == "de") {
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function (copyFrom, copyTo, alsoCopyText, copyEffects) {
				if (copyFrom.text == "Alle Symbole zahlenangefangen bei der äußerst linken Rolle von links nach rechts für alle nebeneinanderliegenden Rollen.")
					copyFrom.text = "Alle Symbole werden von links nach rechts auf benachbarten Rollen ausgezahlt,\n beginnend mit der Rolle ganz links.";
				MMCFLTL.apply(this, arguments);
			};
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});


UHTPatch({
	name: "Patch120747",
	ready: function () {
		return (window["TournamentsManager"] != undefined);
	},
	apply: function () {
		TournamentsManager.prototype.UpdateTournaments = function ( /**Array<TournamentProtocol.Tournament>*/ tournamentsData) {
			this.visibleTournamentsCount = tournamentsData != null ? tournamentsData.length : 0;
			if (this.visibleTournamentsCount > 0) {
				this.EnableTournaments();
				if (this.ShouldCustomSort(tournamentsData)) {
					tournamentsData.sort(function (x, y) {
						return (x.status != y.status) ? x.status - y.status : x.isActiveInOtherGames - y.isActiveInOtherGames
					});
				}
				this.scrollableList.UpdateValues(tournamentsData.slice());

				if (_string.IsNullOrEmpty(XT.GetString(TournamentVars.SelectedTournamentID)))
					XT.SetString(TournamentVars.SelectedTournamentID, tournamentsData[0].uid);

				if (this.isHiddenMode)
					this.DisableTournaments();

				return;
			}

			this.scrollableList.UpdateValues(null);
			this.DisableTournaments();
		};

		TournamentsManager.prototype.ShouldCustomSort = function (tournamentsData) {
			for (var i = 0; i < tournamentsData.length; i++) {
				if (tournamentsData[i].isActiveInOtherGames && tournamentsData[i].status != TournamentProtocol.StatusCode.Closed && tournamentsData[i].status != TournamentProtocol.StatusCode.Invalid)
					return true;
			}
			return false;
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "Patch120311",
	ready: function () {
		return (window["TournamentConnection"] != undefined);
	},
	apply: function () {
		TournamentConnection.prototype.GetPromotions = function ( /**boolean*/ sort) {
			var ret = [];

			if (sort)
				this.promoHolders.sort(TournamentConnection.PromoHolder.Compare);

			for (var i = 0; i < this.promoHolders.length; ++i)
				if (this.promoHolders[i].promotion != null && this.promoHolders[i].promotion.clientMode == TournamentProtocol.ClientMode.Visible) {
					if (this.promoHolders[i].promotion.isActiveInOtherGames && this.promoHolders[i].promotion.status == TournamentProtocol.StatusCode.Closed)
						continue;

					if (_string.IsNullOrEmpty(this.promoHolders[i].promotion.uid))
						this.promoHolders[i].promotion.uid = this.promoHolders[i].uid;

					ret.push(this.promoHolders[i].promotion);
				}

			return ret.length > 0 ? ret : null;
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "Patch120261",
	ready: function () {
		return (window["PromotionsHelper"] != undefined && window["PromotionWarning"] != undefined && window["PromotionsWarning"] != undefined);
	},
	apply: function () {
		PromotionsHelper.GetAnnouncements = function () {
			var ret = [];
			var list = TournamentConnection.instance.FindNewPromoHolders();

			for (var i = 0; i < list.length; ++i) {
				if (list[i].promotion.isActiveInOtherGames)
					continue;

				var item = new PromotionsHelper.AnnouncementInfo();
				item.uid = list[i].uid;
				item.type = list[i].type;
				item.prizesCount = list[i].details.prizePool.totalCount;
				item.prizesAmount = list[i].details.prizePool.totalAmount;
				item.description = list[i].details.shortHtmlRules;
				ret.push(item);
			}

			return ret;
		};

		PromotionWarning.prototype.OnBetChanged = function () {
			if (this.details == null)
				return;

			var totalBet = XT.GetDouble(Vars.TotalBetDisplayed);
			if (isNaN(totalBet))
				return;

			var promo = PromotionsHelper.FindPromotion(this.uid);
			var isConsidered = promo != null && promo.clientMode == TournamentProtocol.ClientMode.Visible && promo.status == TournamentProtocol.StatusCode.Open && !promo.isActiveInOtherGames;

			var minBetLimit = -1;

			var prizePool = this.details.prizePoolTotal != null ? this.details.prizePoolTotal : this.details.prizePool;
			if (prizePool != null && isConsidered)
				minBetLimit = prizePool.minBetLimit;

			var visible = totalBet < minBetLimit;
			if (this.label != null && visible)
				this.label.text = PromotionsWarning.GetMessage(minBetLimit);

			this.SetVisible(visible);
		};

		PromotionsWarning.prototype.OnBetChanged = function () {
			if (this.details == null)
				return;

			var totalBet = XT.GetDouble(Vars.TotalBetDisplayed);
			if (isNaN(totalBet))
				return;

			var minBetLimit = -1;
			var promoTitle = "";
			for (var i = 0; i < this.details.length; ++i) {
				var promo = PromotionsHelper.FindPromotion(this.details[i].uid);
				var isConsidered = promo != null && promo.clientMode == TournamentProtocol.ClientMode.Visible && promo.status == TournamentProtocol.StatusCode.Open && PromotionsHelper.currentPromotionsUUID == this.details[i].uid && !promo.isActiveInOtherGames;

				var prizePool = this.details[i].prizePoolTotal != null ? this.details[i].prizePoolTotal : this.details[i].prizePool;
				if (prizePool != null && isConsidered)
					if (minBetLimit < 0 || minBetLimit < prizePool.minBetLimit) {
						minBetLimit = prizePool.minBetLimit;
						promoTitle = promo.name;
					}
			}

			var visible = totalBet < minBetLimit;
			if (visible) {
				this.label.text = PromotionsWarning.GetMessage(minBetLimit);
				this.promoTitleLabel.text = promoTitle;
			}

			this.SetVisible(visible);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchShowModalFullscreen",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (!window["UHT_GAME_CONFIG_SRC"]["showFullScreenModalForMaintenance"])
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/SystemNotifications/Intrusive/Content/Background/bkg",
			"UI Root/XTRoot/Root/GUI_mobile/SystemNotifications/IntrusiveArrangeable/Intrusive/Content/Land/Background/bkg",
			"UI Root/XTRoot/Root/GUI_mobile/SystemNotifications/IntrusiveArrangeable/Intrusive/Content/Port/Background/bkg"
		];

		for (var i = 0; i < paths.length; i++) {
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null)
				t.localScale(69, 69, 1);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLobbyConnectionTextureMissmatch",
	ready: function () {
		return (window["LobbyConnection"] != undefined);
	},
	apply: function () {
		var oLC_LT = LobbyConnection.prototype.LoadTexture;
		LobbyConnection.prototype.LoadTexture = function (symbol, data) {
			this.texturesToLoadCount++;
			oLC_LT.apply(this, arguments);
		};

		var oldTexturesToLoadCount = 0;
		var oLC_AT = LobbyConnection.prototype.AddTexture;
		LobbyConnection.prototype.AddTexture = function (suffix, symbol, force, forceUrl) {
			oldTexturesToLoadCount = this.texturesToLoadCount;
			oLC_AT.apply(this, arguments);
			if (oldTexturesToLoadCount != this.texturesToLoadCount)
				this.texturesToLoadCount--;
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFSPurchaseManager",
	ready: function () {
		return (window["FreeSpinsPurchaseManager"] != undefined);
	},
	apply: function () {
		var oFSPM_UDO = FreeSpinsPurchaseManager.prototype.UpdateDisplayedOptions;
		FreeSpinsPurchaseManager.prototype.UpdateDisplayedOptions = function () {
			if (this.fsPurchaseConfig == null)
				return;
			oFSPM_UDO.call(this);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDGA",
	ready: function () {
		return (window["dga"] != undefined);
	},
	apply: function () {
		window["dga"] = {
			websocket: null,
			wsUrl: null,
			tableId: null,
			casinoId: null,
			tryToConnect: true,

			// public
			connect: function (wsUrl, casinoId, tableId) {
				var self = this;
				self.tryToConnect = true;
				self.wsUrl = wsUrl;
				console.log('connecting to ' + wsUrl);
				if (self.websocket !== null && self.websocket.readyState == 1) {
					self.websocket.close();
					console.log('Socket open closing it');
				}
				self.websocket = new WebSocket(wsUrl);
				self.websocket.onopen = function (evt) {
					self.onWsOpen(evt, casinoId, tableId)
				};
				self.websocket.onclose = function (evt) {
					self.onWsClose(evt)
				};
				self.websocket.onmessage = function (evt) {
					self.onWsMessage(evt)
				};
				self.websocket.onerror = function (evt) {
					self.onWsError(evt)
				};
				if (tableId) {
					self.tableId = tableId;
				}
				self.casinoId = casinoId;
			},
			// public
			onMessage: function (data) {
				XT.SetObject(DgaVars.DgaMessage, data);
				XT.TriggerEvent(DgaVars.Evt_Internal_DgaMessage);
			},
			// public
			onConnect: function () {
				XT.TriggerEvent(DgaVars.Evt_Internal_DgaConnected);
			},
			// public
			disconnect: function () {
				var self = this;
				self.tryToConnect = false;
				if (self.websocket.readyState == 1)
					self.websocket.close();
				console.log('Disconnected');
			},
			// public
			subscribe: function (casinoId, tableId, currency) {
				var subscribeMessage = {
					type: 'subscribe',
					key: tableId,
					casinoId: casinoId,
					currency: currency
				}
				console.log('subscribing' + tableId);

				var self = this;
				// console.log('Subscribing ' + tableId);
				var jsonSub = JSON.stringify(subscribeMessage);
				self.doWsSend(jsonSub);
			},

			// public
			available: function (casinoId) {
				var availableMessage = {
					type: 'available',
					casinoId: casinoId
				}
				console.log('checking availability');

				var self = this;
				// console.log('Subscribing ' + tableId);
				var jsonSub = JSON.stringify(availableMessage);
				self.doWsSend(jsonSub);
			},

			onWsOpen: function (evt) {
				var self = this;

				// console.log(evt.data);
				if (self.onConnect != null) {
					self.onConnect();
				}

				console.log('Connected to wss server');
				if (self.tableId) {
					self.subscribe(self.casinoId, self.tableId)
				}
			},

			onWsClose: function (evt) {
				console.log("DISCONNECTED");
				var self = this;
				if (self.tryToConnect === true) {
					console.log("RECONNECTING");
					self.connect(self.wsUrl, self.casinoId, self.tableId);
				}
			},

			onWsMessage: function (evt) {
				var self = this;
				var data = JSON.parse(evt.data);
				// console.log(evt.data);
				if (self.onMessage != null) {
					self.onMessage(data);
				}
			},

			onWsError: function (evt) {
				console.log('ERROR: ' + evt.data);
			},

			ping: function () {
				var self = this;
				var pingMessage = {
					type: 'ping',
					pingTime: Date.now().toString()
				}
				var jsonSub = JSON.stringify(pingMessage);
				self.doWsSend(jsonSub);
			},

			doWsSend: function (message) {
				var self = this;
				console.log("SENT: " + message);
				if (self.websocket.readyState == 1)
					self.websocket.send(message);
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchBetwayLOGOUT",
	ready: function () {
		return (window["Runtime"] != undefined);
	},
	apply: function () {
		if (!window["UHT_GAME_CONFIG_SRC"])
			return;

		if (!window["BetwayAPI"])
			return;

		if (UHT_GAME_CONFIG_SRC["integrationType"] != "BETWAY")
			return;

		UHTInterfaceBOSS.PostMessage = function ( /**string*/ message) {
			if (message == "gameLoadingEnded")
				BetwayAPI.PostMessage("BRIDGE_API_READY");
			else if (message == "gameRoundStarted")
				BetwayAPI.PostMessage("BUSY");
			else if (message == "gameRoundEnded")
				BetwayAPI.PostMessage("IDLE");
			else if (message == "openCashier")
				BetwayAPI.PostMessage("LAUNCH_BANKING");
			else if (message == "gameQuit")
				BetwayAPI.PostMessage("CLOSE_GAME");
		};

		UHTInterfaceBOSS.OnSystemMessage = function (type) {
			// if (type == "PleaseLogin")
			// 	BetwayAPI.PostMessage("LOGOUT", undefined, undefined, undefined, {reason: 106});
			if (type == "Timeout")
				BetwayAPI.PostMessage("LOGOUT", undefined, undefined, undefined, {
					reason: 104
				});
		};
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchNOPP",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (!IsRequired("NOPP"))
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/PragmaticPlayAnchor",
			"UI Root/XTRoot/Root/GUI_mobile/PragmaticPlay"
		];

		for (var i = 0; i < paths.length; i++) {
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null) {
				t.localScale(0, 0, 0);
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchNOCLK",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["ClockDisplayer"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (!IsRequired("NOCLK"))
			return;

		var clockDisplayers = globalRuntime.sceneRoots[1].GetComponentsInChildren(ClockDisplayer, true);
		for (var i = 0; i < clockDisplayers.length; i++)
			clockDisplayers[i].transform.localScale(0, 0, 0);
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchReleaseJSONSMemory",
	ready: function () {
		return (window["Runtime"] != undefined);
	},
	apply: function () {
		var oR_ANSR = Runtime.prototype.addNewSceneRoot;
		Runtime.prototype.addNewSceneRoot = function (obj) {
			if (this.sceneRoots.length > 0) //already has client, so now it's adding game
				JsonsToImport = [];
			oR_ANSR.apply(this, arguments);
		};
	},
	retry: function () {
		return (window["Runtime"] == undefined);
	}
});

UHTPatch({
	name: "PatchAnimatedParticleFrames",
	ready: function () {
		return (window["Runtime"] != undefined);
	},
	apply: function () {
		if (!window["AnimatedParticleFrames"])
			return;

		var oAPF_BS = AnimatedParticleFrames.prototype.BuildSprites;
		AnimatedParticleFrames.prototype.BuildSprites = function () {
			this.atlas.initAtlas();
			oAPF_BS.apply(this, arguments);
		};
	},
	retry: function () {
		return (window["Runtime"] == undefined);
	}
});

UHTPatch({
	name: "PatchInfinityAutoplay",
	ready: function () {
		return (window["XT"] != undefined && window["XT"]["RegisterAndInitDone"] &&
			window["ValueDisplayer"] != undefined && window["Slider"] != undefined);
	},
	apply: function () {
		if (IsRequired("INFAP")) {
			if (!window["AutoplayControllerMobile"])
				return;
			var isInfinityAutoplay = false;
			var OnAutoSpinsLeft = function (value) {
				if (value < 99999998) {
					isInfinityAutoplay = false;
				}

				if (value != -1 && isInfinityAutoplay)
					XT.SetInt(Vars.AutoplaySpinsLeft, 99999999);
			};

			var OnAutoSpinsLeftDisplayed = function (value) {
				if (value != "∞" && isInfinityAutoplay)
					XT.SetInt(Vars.AutoplaySpinsLeftDisplayed, "∞")
			};

			var OnStopAutoplay = function () {
				isInfinityAutoplay = false;
			};

			var OnStoppedAutoplayByCondition = function () {
				isInfinityAutoplay = false;
			};

			XT.RegisterCallbackInt(Vars.AutoplaySpinsLeft, OnAutoSpinsLeft, this);
			XT.RegisterCallbackInt(Vars.AutoplaySpinsLeftDisplayed, OnAutoSpinsLeftDisplayed, this);
			XT.RegisterCallbackEvent(Vars.Evt_DataToCode_StopAutoplay, OnStopAutoplay, this);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_StoppedAutoplayByCondition, OnStoppedAutoplayByCondition, this);

			var autoplayControllers = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobile, true);
			var advanced = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerAdvanced, true);
			autoplayControllers = autoplayControllers.concat(advanced);
			for (var i = 0; i < autoplayControllers.length; i++) {
				var sliders = autoplayControllers[i].GetComponentsInChildren(Slider, true);
				for (var j = 0; j < 1; j++) {
					sliders[j].values.push("∞");
					for (var k = 0; k < sliders[j].valueDisplayers.length; k++) {
						sliders[j].valueDisplayers[k].allowDOG = false;
					}
				}
			}

			var oVD_OTVC = ValueDisplayer.prototype.OnTargetValueChanged;
			ValueDisplayer.prototype.OnTargetValueChanged = function (newVal) {
				oVD_OTVC.apply(this, arguments);
				if (newVal == "∞") {
					isInfinityAutoplay = true;
					this.label.text = "∞";
				}
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchBigWinLevelEvent",
	ready: function () {
		return (window["XT"] != undefined && window["XT"]["RegisterAndInitDone"]);
	},
	apply: function () {
		UHTInterfaceBOSS.OnBigWin = function (isBigWin) {
			if (!isBigWin)
				return;

			if (UHTInterfaceBOSS.enabled) {
				var args = {
					event: "bigWinLevel",
					params: {
						level: XT.GetInt(Vars.SpinResultBigWinLevel)
					}
				};

				UHTInterfaceBOSS.PostMessageRec(window.parent, args);
			}
		};
		XT.RegisterCallbackBool(Vars.SpinResultIsBigWin, UHTInterfaceBOSS.OnBigWin, UHTInterfaceBOSS);
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchWidgetColorAnimatorAwake",
	ready: function () {
		return (window["WidgetColorAnimator"] != undefined);
	},
	apply: function () {
		WidgetColorAnimator.prototype.Awake = function () {
			this.Start();
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentConnectionPopulatePrizesTotalCount103698",
	ready: function () {
		return (window["TournamentConnection"] != undefined);
	},
	apply: function () {
		TournamentConnection.prototype.PopulatePrizesTotalCount = function (holder) {
			if (holder.details == null ||
				holder.details.prizePool == null ||
				holder.details.prizePool.prizesList == null ||
				holder.details.prizePoolTotal == null ||
				holder.details.prizePoolTotal.prizesList == null)
				return;

			var prizes = holder.details.prizePool.prizesList;
			var prizesTotal = holder.details.prizePoolTotal.prizesList;

			for (var i = 0; i < prizes.length; ++i) {
				var prize = prizes[i];
				var prizeTotal = this.FindPrizeByID(prizesTotal, prize.prizeID);
				if (prizeTotal != null)
					prize.totalCount = prizeTotal.count;
			}
		};
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideAutoplayInMini103530",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (Globals.isMini) {
			this.OnGameInit = function () {
				var pathsMini = [
					"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/MenuWindow/Content/AutoPlay",
				];

				for (var i = 0; i < pathsMini.length; i++) {
					var t = globalRuntime.sceneRoots[1].transform.Find(pathsMini[i]);
					if (t != null) {
						t.gameObject.SetActive(!XT.GetBool(Vars.Jurisdiction_DisableAutoplay));
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnGameInit, this);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLobbyCategoryDailyWins",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && window["UHT_GAME_CONFIG_SRC"]["region"] == "Asia") {

			this.OnXTGameInit = function () {
				var newText = "Daily Wins";
				if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "zh")
					newText = "天天送";

				if (!Globals.isMobile) {
					var pathsDesktop = [
						"UI Root/XTRoot/Root/MultiLobby/Lobby/Content/Holder_Categories/Static/Categories/Tabs/T_3/Content/Active/L",
						"UI Root/XTRoot/Root/MultiLobby/Lobby/Content/Holder_Categories/Static/Categories/Tabs/T_3/Content/Inactive/L"
					];

					for (var i = 0; i < pathsDesktop.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
						if (t != null) {
							var l = t.GetComponent(UILabel);
							if (l != null)
								l.text = newText;
						}
					}
				} else if (!Globals.isMini) {
					var pathsMobile = [
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Land/Static/Categories/Tabs/T_3/Content/Active/L",
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Land/Static/Categories/Tabs/T_3/Content/Inactive/L",
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Port/Static/Categories/Tabs/T_3/Content/Active/L",
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Port/Static/Categories/Tabs/T_3/Content/Inactive/L"
					];

					for (var i = 0; i < pathsMobile.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobile[i]);
						if (t != null) {
							var l = t.GetComponent(UILabel);
							if (l != null)
								l.text = newText;
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchVerifyGameAuthenticityTracking",
	ready: function () {
		return (window["VerifyGameAuthenticityManager"] != undefined);
	},
	apply: function () {
		var GA_SENT_AM_VISIBLE = false;
		var GA_SENT_AM_CLICKED = false;
		VerifyGameAuthenticityManager.prototype.OnTouchEnd = function () {
			if (!XT.GetBool(Vars.VerifyGameAuthenticity))
				return;

			for (var btnIdx = 0; btnIdx < this.buttons.length; btnIdx++) {
				if (this.buttons[btnIdx].activeInHierarchy) {
					var mask = new LayerMask();
					mask.mask = 1 << this.buttons[btnIdx].layer;
					var c = globalColliderInputManager.getHoveredCollider(this.cachedCamera.ScreenToWorldPoint(Input.mousePosition), mask);
					if (!this.wasTouchMove && (c == this.buttons[btnIdx].collider)) {
						if (!this.IsWebView())
							window.open(ServerOptions.gameVerificationUrl);
						else
							this.mustOpen = true;

						if (!GA_SENT_AM_CLICKED) {
							globalTracking.SendEvent("uht_behaviour", "VerifyGameAuthenticity_Clicked", 0, "BehaviourTracker");
							GA_SENT_AM_CLICKED = true;
						}
					}
				}
			}
		};
		VerifyGameAuthenticityManager.prototype.Update = function () {
			if (!GA_SENT_AM_VISIBLE) {
				for (var btnIdx = 0; btnIdx < this.buttons.length; btnIdx++) {
					if (this.buttons[btnIdx].activeInHierarchy) {
						globalTracking.SendEvent("uht_behaviour", "VerifyGameAuthenticity_Visible", 0, "BehaviourTracker");
						GA_SENT_AM_VISIBLE = true;
					}
					if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "ko") {
						var newTextKO = "정품 인증 게임 확인";
						var labels = this.buttons[btnIdx].GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++) {
							labels[i].text = newTextKO;
						}
					}
				}
			}
			if (this.mustOpen) {
				this.mustOpen = false;
				this.OpenIframe();
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchMLA",
	ready: function () {
		return (window["MultipleLabelAnchor"] != undefined);
	},
	apply: function () {
		if (window["MultiLobbyConnection"] == undefined)
			return;

		MultipleLabelAnchor.prototype.Start = function () {
			if (this.scaleY == undefined)
				this.scaleY = true;
			if (this.isStarted)
				return;

			this.isStarted = true;
			this.initialScale = this.gameObject.transform.localScale();

			for (var i = 0; i < this.labels.length; i++) {
				this.cachedLabelWidths.push(-69);
				this.cachedActiveState.push(false);
			}
		};

		MultipleLabelAnchor.prototype.Update = function () {
			this.Start();

			var i = 0;
			var needUpdate = false;
			for (i = 0; i < this.labels.length; i++) {
				if (typeof (this.labels[i].fontName) == "object")
					this.labels[i].OnWillRenderObject();
				var w = this.GetLabelWidth(this.labels[i]);
				if (w != this.cachedLabelWidths[i] || (this.ignoreInactiveLabels && this.labels[i].gameObject.activeInHierarchy != this.cachedActiveState[i])) {
					this.cachedLabelWidths[i] = w;
					this.cachedActiveState[i] = this.labels[i].gameObject.activeInHierarchy;
					needUpdate = true;
				}
			}

			if (needUpdate || this.mustForcedNextUpdate) {
				this.mustForcedNextUpdate = false;
				var offset = 0;
				var p;

				for (i = 0; i < this.labels.length; i++) {
					if (this.ignoreInactiveLabels && this.cachedActiveState[i] == false)
						continue;

					var x = ((this.alignment == MultipleLabelAnchor.Alignment.Left) ? -1 : 1) * offset;
					p = this.labels[i].gameObject.transform.localPosition();
					this.labels[i].gameObject.transform.localPosition(x, p.y, p.z);
					offset += this.cachedLabelWidths[i] + this.spacing;
				}

				var size = offset - this.spacing;

				if (this.alignment == MultipleLabelAnchor.Alignment.Center) {
					var halfSize = size / 2;

					for (i = 0; i < this.labels.length; i++) {
						if (this.ignoreInactiveLabels && this.cachedActiveState[i] == false)
							continue;

						var xOffset = this.labels[i].gameObject.transform.localPosition().x - halfSize;
						p = this.labels[i].gameObject.transform.localPosition();
						this.labels[i].gameObject.transform.localPosition(xOffset, p.y, p.z);
					}
				}

				if (this.anyPivots) {
					for (i = 0; i < this.labels.length; i++) {
						if (this.ignoreInactiveLabels && this.cachedActiveState[i] == false)
							continue;

						if (this.alignment == MultipleLabelAnchor.Alignment.Center || this.alignment == MultipleLabelAnchor.Alignment.Right) {
							if (this.IsPivot(MultipleLabelAnchor.pivotCenter, this.labels[i].anchorX)) {
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x + this.GetLabelWidth(this.labels[i]) * 0.5, p.y, p.z);
							} else if (this.IsPivot(MultipleLabelAnchor.pivotRight, this.labels[i].anchorX)) {
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x + this.GetLabelWidth(this.labels[i]), p.y, p.z);
							}
						} else {
							if (this.IsPivot(MultipleLabelAnchor.pivotCenter, this.labels[i].anchorX)) {
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x - this.GetLabelWidth(this.labels[i]) * 0.5, p.y, p.z);
							} else if (this.IsPivot(MultipleLabelAnchor.pivotLeft, this.labels[i].anchorX)) {
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x - this.GetLabelWidth(this.labels[i]), p.y, p.z);
							}
						}
					}
				}

				if (this.maxWidth > 0 && size > this.maxWidth) {
					var scale = this.maxWidth / size;
					this.gameObject.transform.localScale(scale, this.scaleY ? scale : this.initialScale.y, this.initialScale.z);
				} else {
					this.gameObject.transform.localScale(this.initialScale);
				}

				this.width = size;
			}
		};

		MultipleLabelAnchor.prototype.GetLabelWidth = function ( /**UILabel*/ label) {
			return this.ignoreLabelsScale ? label.GetWidth() : Math.round(label.GetWidth() * label.transform.localScale().x);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFRBWindowText",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		var frbPathsDesktop = [
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/ManuallyCredited",
		];

		var frbPathsLandscape = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/ManuallyCredited",
		];

		var frbPathsPortrait = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/ManuallyCredited",
		];

		var activate = function (t, param) {
			if (!IsRequired("MAC"))
				return;

			if (t != null) {
				var targetComponent = t.GetComponentsInChildren(XTVariable2CAT, true);
				if (targetComponent.length > 0) {
					if (param == "") {
						if (targetComponent[0].notEquals.cat != null)
							targetComponent[0].notEquals.Start();
					} else {
						if (targetComponent[0].equals.cat != null)
							targetComponent[0].equals.Start();
					}
				}
			}
		}

		var OnBonusPromoRoundType = function (param) {
			var root = globalRuntime.sceneRoots[1];
			if (!Globals.isMobile) {
				for (var i = 0; i < frbPathsDesktop.length; ++i) {
					var t = root.transform.Find(frbPathsDesktop[i]);
					activate(t, param);
				}
			} else {
				for (var i = 0; i < frbPathsLandscape.length; ++i) {
					var t = root.transform.Find(frbPathsLandscape[i]);
					activate(t, param);
				}

				for (var i = 0; i < frbPathsPortrait.length; ++i) {
					var t = root.transform.Find(frbPathsPortrait[i]);
					activate(t, param);
				}
			}
		};

		var OnXTGameInit = function () {
			OnBonusPromoRoundType("");
		}

		XT.RegisterCallbackString(Vars.BonusRoundPromoType, OnBonusPromoRoundType, this);
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this);
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchInterfaceControllerChangeState",
	ready: function () {
		return (window["InterfaceController"] != undefined);
	},
	apply: function () {
		var oIC_CS = InterfaceController.prototype.ChangeState;
		InterfaceController.prototype.ChangeState = function (newState) {
			oIC_CS.apply(this, arguments);
			switch (newState) {
				case VSGameState.Result:
					this.CloseCurrentOpenedWindow();
					break;
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchReplayManagerLabel",
	ready: function () {
		return (window["ReplayManager"] != undefined);
	},
	apply: function () {
		var oRM_OGI = ReplayManager.prototype.OnGameInit;
		ReplayManager.prototype.OnGameInit = function () {
			oRM_OGI.apply(this, arguments);
			var widgetColorAnimators = this.GetComponentsInChildren(WidgetColorAnimator, true);
			for (var wIdx = 0; wIdx < widgetColorAnimators.length; wIdx++) {
				var labels = widgetColorAnimators[wIdx].targetWidgets;
				for (var lIdx = 0; lIdx < labels.length; lIdx++) {
					labels[lIdx].anchorX = 1;
					var pos = labels[lIdx].transform.localPosition();
					labels[lIdx].transform.localPosition(130, pos.y, pos.z);
					labels[lIdx].init(true);
				}
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchReplayDirector",
	ready: function () {
		return (window["ReplayDirector"] != undefined);
	},
	apply: function () {
		ReplayDirector.prototype.PatchButtonAutoClickers = function ( /*number*/ delayMultiplier) {
			var hotKeyClicker = globalRuntime.sceneRoots[1].GetComponentsInChildren(HotKeyClicker, true);
			for (var i = 0; i < hotKeyClicker.length; i++) {
				if (hotKeyClicker[i].transform.parent.gameObject.name == "ReplayLBLSkipper")
					continue;

				if (hotKeyClicker[i].transform.GetComponentsInChildren(ButtonAutoClicker, true).length == 0)
					hotKeyClicker[i].gameObject.AddComponent("ButtonAutoClicker");

				var buttons = hotKeyClicker[i].transform.GetComponentsInChildren(ButtonAutoClicker, true);
				for (var j = 0; j < buttons.length; j++) {
					buttons[j].transform.GetComponentsInChildren(ButtonAutoClicker, true)[0].delay = 3;
					buttons[j].transform.GetComponentsInChildren(ButtonAutoClicker, true)[0].delayInAutoplay = 3;
				}
			}
			var clickers = globalRuntime.sceneRoots[1].GetComponentsInChildren(ButtonAutoClicker, true);
			for (var i = 0; i < clickers.length; i++) {
				clickers[i].delay = clickers[i].delayInAutoplay * delayMultiplier;
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchLoadOperatorAdapter",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply: function () {
		var shouldLoad = false;
		var evalExp = null;
		var scriptName = null;

		if (IsRequired("COI")) {
			var operatorList = ["PLAYTECH", "SISAL"];
			var operatorPayloads = ['UHT_GAME_CONFIG_SRC["extend_events_listener"] = "window";', 'UHT_GAME_CONFIG_SRC["extend_events_listener"] = "window";'];
			var operatorIndex = operatorList.indexOf(UHT_GAME_CONFIG_SRC.integrationType);
			scriptName = UHT_GAME_CONFIG_SRC.integrationType;
			if (operatorIndex != -1) {
				shouldLoad = true;
				evalExp = operatorPayloads[operatorIndex];
			}
		}

		if (IsRequired("KZING")) {
			scriptName = "KZING";
			shouldLoad = true;
			UHT_GAME_CONFIG_SRC["extend_events_listener"] = "window";
			var timeoutPatchUHTIB = null;

			function PatchUHTIB() {
				if (window["UHTInterfaceBOSS"] == undefined) {
					timeoutPatchUHTIB = setTimeout(PatchUHTIB, 100);
					return;
				}
				UHTInterfaceBOSS.listener = window;
			}
			PatchUHTIB();
		}

		if (shouldLoad) {
			if (evalExp != null)
				eval(evalExp);

			var path = "";
			if (UHT_GAME_CONFIG_SRC.embeddedRemappedSymbol) {
				path = UHT_CONFIG.GAME_URL;
			} else {
				var split = UHT_CONFIG.GAME_URL.split("/");
				split.splice(split.indexOf(UHT_CONFIG.SYMBOL) - 2);
				path = split.join("/") + "/";
			}
			path += scriptName + ".js";

			var retryCounter = 0;
			var successCallback = function () {
				loadingComplete = true;
				if (window["onClientLoaded"] != undefined && savedText != "")
					onClientLoaded(savedText);
			};

			var errorCallback = function () {
				document.getElementsByTagName("HEAD")[0].removeChild(script);
				if (retryCounter < 5) {
					retryCounter++;
					setTimeout(function () {
						script = loadScript(path, successCallback, errorCallback);
					}, 10000);
				}
			};

			var loadScript = function (url, loadCallback, errorCallback) {
				var script = document.createElement("script");
				script.src = url;

				if (loadCallback != undefined)
					script.onload = loadCallback;

				if (errorCallback != undefined) {
					script.onabort = errorCallback;
					script.onerror = errorCallback;
				}

				document.getElementsByTagName("HEAD")[0].appendChild(script);

				return script;
			}

			var loadingComplete = false;
			var savedText = "";
			UHTPatch({
				name: "PatchOnClientLoaded",
				ready: function () {
					return (window["onClientLoaded"] != undefined);
				},
				apply: function () {
					var oCL = onClientLoaded;
					onClientLoaded = function (text) {
						savedText = text;
						if (loadingComplete)
							oCL.apply(this, arguments)
					}
				},
				retry: function () {
					return (window["Renderer"] == undefined);
				},
				interval: 10
			});
			var script = loadScript(path, successCallback, errorCallback);
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchTournamentPointsNotificationReplay",
	ready: function () {
		return (window["TournamentPointsNotification"] != undefined);
	},
	apply: function () {
		var oTPN_XTRC = TournamentPointsNotification.prototype.XTRegisterCallbacks;
		TournamentPointsNotification.prototype.XTRegisterCallbacks = function () {
			if (ServerOptions.isReplay)
				return;
			oTPN_XTRC.apply(this, arguments);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentButton",
	ready: function () {
		return window["TournamentButton"] != undefined;
	},
	apply: function () {
		var oTB_A = TournamentButton.prototype.Awake;
		TournamentButton.prototype.Awake = function () {
			if (this.IDNCSM != null) {
				var sprites = this.IDNCSM.GetComponentsInChildren(UISprite, true);
				for (var i = 0; i < sprites.length; i++)
					if (sprites[i].spriteName == "IDNCSM_lobby")
						sprites[i].spriteName = "IDNSM_lobby";
			}
			oTB_A.apply(this, arguments);
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchMouseWheelScrolling",
	ready: function () {
		return (window["CustomDragObject"] != undefined);
	},
	apply: function () {
		CustomDragObject.prototype.OnMouseWheel = function (e) {
			if (this.gameObject.activeInHierarchy && this.useScrollWheel)
				e.preventDefault();
			if (!this.gameObject.activeInHierarchy || !this.isHover || Globals.InputBlocked && !(this.cachedCamera != null && this.cachedCamera.ignoreInputBlocked))
				return;
			this.wheelDirection = e.wheelDelta ? -e.wheelDelta : e.detail;
			this.wheelDirection = UHTMath.clamp(this.wheelDirection, -1, 1)
		};
		ScrollableList.prototype.OnMouseWheel = function (e) {
			if (!this.isEnabled || !this.wasHover || Globals.InputBlocked && !(this.cachedCamera != null && this.cachedCamera.ignoreInputBlocked))
				return;
			e.preventDefault();
			this.wheelDelta = e.wheelDelta ? -e.wheelDelta : e.detail;
			this.wheelDelta = UHTMath.clamp(this.wheelDelta, -1, 1);
			this.scrollDelta = 0
		};
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchConvertDynamicFields",
	ready: function () {
		return (window["PromotionsHelper"] != undefined);
	},
	apply: function () {
		var oPHCDF = PromotionsHelper.ConvertDynamicFields;
		PromotionsHelper.ConvertDynamicFields = function () {
			var details = arguments[0];
			if (details != null) {
				for (var dfName in details.dynamicFieldMap) {
					var dfi = details.dynamicFieldMap[dfName];
					var dfValue = dfi.defaultValue;
					if (dfi.valueMap[ServerOptions.currency] == undefined)
						if (dfi.valueMap[ServerOptions.realCurrency] != undefined)
							dfi.valueMap[ServerOptions.currency] = dfi.valueMap[ServerOptions.realCurrency]
				}

				if (details.prizePool.prizesList == null)
					details.prizePool.prizesList = [];
			}

			oPHCDF.apply(this, arguments);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLoseStreakText",
	ready: function () {
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
		for (var i = 0; i < labels.length; i++) {
			if (labels[i].text == "You gained {0} points for a lose streak")
				labels[i].text = "You gained {0} points for consecutive spins without any win";
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

var SOCE_replacements = [{
	src: "malfunction voids all pays and plays",
	dst: "malfunction voids all spins and plays"
},
{
	src: "win feature",
	dst: "play feature"
},
{
	src: "pay out",
	dst: "award"
},
{
	src: "paid out",
	dst: "awarded"
},
{
	src: "pays out",
	dst: "awards"
},
{
	src: "betting",
	dst: "spinning"
},
{
	src: "total bet",
	dst: "spin"
},
{
	src: "bet",
	dst: "spin",
	wordonly: true
},
{
	src: "bets",
	dst: "spins"
},
{
	src: "cash",
	dst: "coins"
},
{
	src: "payer",
	dst: "winner"
},
{
	src: "pay",
	dst: "win"
},
{
	src: "pays",
	dst: "wins"
},
{
	src: "paid",
	dst: "won"
},
{
	src: "money",
	dst: "coin"
},
{
	src: "buy",
	dst: "play"
},
{
	src: "bought",
	dst: "instantly triggered"
},
{
	src: "purchase",
	dst: "play"
},
{
	src: "at the cost of",
	dst: "for"
},
{
	src: "rebet",
	dst: "respin"
},
{
	src: "cost of",
	dst: "can be played for"
},
];


UHTPatch({
	name: "PatchTableGamesRulesSOCE",
	ready: function () {
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined);
	},
	apply: function () {
		if (IsRequired("SOCE")) {
			if (IsRequired("SOCE_V1"))
				SOCE_replacements.push({
					src: "credit",
					dst: "coins"
				});
			if (IsRequired("SOCE_V2")) {
				SOCE_replacements.push({
					src: "gambled",
					dst: "chanced"
				});
				SOCE_replacements.push({
					src: "gamble",
					dst: "take a chance"
				});
				SOCE_replacements.push({
					src: "gambling",
					dst: "taking a chance"
				});
			}
			if (IsRequired("SOCE_V5")) {
				SOCE_replacements.push({
					src: "please fund your account",
					dst: "please buy more coins"
				});
				SOCE_replacements.push({
					src: "funds",
					dst: "coins"
				});
			}

			TableGamesOnTouchEnd = function () {
				if (this.gameObject.activeInHierarchy) {
					var mask = new LayerMask();
					mask.mask = 1 << this.gameObject.layer;

					if (this.cachedCamera == null)
						this.cachedCamera = Globals.GetCameraForObject(this.gameObject);

					var c = globalColliderInputManager.getHoveredCollider(this.cachedCamera.ScreenToWorldPoint(Input.mousePosition), mask);
					if (!this.wasTouchMove && (c == this.gameObject.collider)) {
						var url = UHT_CONFIG.GAME_URL + "extra/rules_" + ServerOptions.language + ".htm";
						var name = url.replace(/\//g, "_");

						var fo = new FormatOptions();
						fo.hasCurrency = true;
						var minValue = LocaleManager.FormatValue(XT.GetDouble(TGVars.MinBet), fo);
						var maxValue = LocaleManager.FormatValue(XT.GetDouble(TGVars.MaxBet), fo);
						var data = window.btoa(encodeURIComponent(minValue + "&" + maxValue))
						url += "?" + data;

						new ResourceRequest({
							url: url,
							complete: new EventHandler(null, function ( /**ResourceRequest*/ request, /**string*/ unused) {
								var document = new DOMParser().parseFromString(request.Data, "text/html");
								var node, nodes = [],
									walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
								while (node = walker.nextNode()) nodes.push(node);

								for (var i = 0; i < SOCE_replacements.length; i++) {
									var soce = SOCE_replacements[i];
									var p = soce.wordonly ? "\\b" : "";
									var s = soce.wordonly ? "\\b" : "";
									for (var j = 0; j < nodes.length; j++) {
										var foundIndex = nodes[j].nodeValue.toLowerCase().indexOf(soce.src);
										if (foundIndex != -1) {
											if (nodes[j].nodeValue == nodes[j].nodeValue.toLowerCase())
												nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(p + soce.src + s, 'g'), soce.dst);
											else if (nodes[j].nodeValue == nodes[j].nodeValue.toUpperCase())
												nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(p + soce.src.toUpperCase() + s, 'g'), soce.dst.toUpperCase());
											else {
												if ((nodes[j].nodeValue[foundIndex] == nodes[j].nodeValue[foundIndex].toUpperCase()) && (nodes[j].nodeValue[foundIndex + 1] == nodes[j].nodeValue[foundIndex + 1].toLowerCase())) {
													var src = soce.src.split('');
													src[0] = src[0].toUpperCase();
													src = src.join('');
													var dst = soce.dst.split('');
													dst[0] = dst[0].toUpperCase();
													dst = dst.join('');
													nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(src, 'g'), dst);
												}
												foundIndex = nodes[j].nodeValue.toUpperCase().indexOf(soce.src.toUpperCase());
												if (foundIndex != -1)
													if ((nodes[j].nodeValue[foundIndex] == nodes[j].nodeValue[foundIndex].toUpperCase()) && (nodes[j].nodeValue[foundIndex + 1] == nodes[j].nodeValue[foundIndex + 1].toUpperCase()))
														nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(p + soce.src.toUpperCase() + s, 'g'), soce.dst.toUpperCase());
												foundIndex = nodes[j].nodeValue.toLowerCase().indexOf(soce.src);
												if (foundIndex != -1)
													if ((nodes[j].nodeValue[foundIndex] == nodes[j].nodeValue[foundIndex].toLowerCase()) && (nodes[j].nodeValue[foundIndex + 1] == nodes[j].nodeValue[foundIndex + 1].toLowerCase()))
														nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(p + soce.src + s, 'g'), soce.dst);
											}
										}
									}
								}

								var minBetValueContainer = document.getElementById("minBetValue");
								if (minBetValueContainer != null) minBetValueContainer.innerText = minValue;
								var maxBetValueContainer = document.getElementById("maxBetValue");
								if (maxBetValueContainer != null) maxBetValueContainer.innerText = maxValue;

								var wnd = window.open("", name);
								if (wnd) {
									wnd.document.write(document.documentElement.outerHTML);
									wnd.focus();
								}
							})
						});
					}
				}
			}
			//Blackjack and Baccarat
			if (window["BJRulesButton"] != undefined)
				BJRulesButton.prototype.OnTouchEnd = TableGamesOnTouchEnd;

			//Roulette
			if (window["RlRulesButton"] != undefined)
				RlRulesButton.prototype.OnTouchEnd = TableGamesOnTouchEnd;
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});


UHTPatch({
	name: "PatchUILabelText",
	ready: function () {
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (IsRequired("SOCE")) {
			if (IsRequired("SOCE_V1"))
				SOCE_replacements.push({
					src: "credit",
					dst: "coins"
				});
			if (IsRequired("SOCE_V2")) {
				SOCE_replacements.push({
					src: "gambled",
					dst: "chanced"
				});
				SOCE_replacements.push({
					src: "gamble",
					dst: "take a chance"
				});
				SOCE_replacements.push({
					src: "gambling",
					dst: "taking a chance"
				});
			}
			if (IsRequired("SOCE_V3X")) {
				SOCE_replacements = [];
				SOCE_replacements.push({
					src: "slots",
					dst: "SpinaZonke"
				});
			}
			if (IsRequired("SOCE_V4X")) {
				SOCE_replacements = [];
				SOCE_replacements.push({
					src: "slots",
					dst: "SpinaWina"
				});
			}
			if (IsRequired("SOCE_V5")) {
				SOCE_replacements.push({
					src: "please fund your account",
					dst: "please buy more coins"
				});
				SOCE_replacements.push({
					src: "funds",
					dst: "coins"
				});
			}

			var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
			for (var i = 0; i < SOCE_replacements.length; i++) {
				var soce = SOCE_replacements[i];
				var p = soce.wordonly ? "\\b" : "";
				var s = soce.wordonly ? "\\b" : "";
				for (var j = 0; j < labels.length; j++) {
					var foundIndex = labels[j].text.toLowerCase().indexOf(soce.src);
					if (foundIndex != -1) {
						if (labels[j].text == labels[j].text.toLowerCase())
							labels[j].text = labels[j].text.replace(new RegExp(p + soce.src + s, 'g'), soce.dst);
						else if (labels[j].text == labels[j].text.toUpperCase())
							labels[j].text = labels[j].text.replace(new RegExp(p + soce.src.toUpperCase() + s, 'g'), soce.dst.toUpperCase());
						else {
							if ((labels[j].text[foundIndex] == labels[j].text[foundIndex].toUpperCase()) && (labels[j].text[foundIndex + 1] == labels[j].text[foundIndex + 1].toLowerCase())) {
								var src = soce.src.split('');
								src[0] = src[0].toUpperCase();
								src = src.join('');
								var dst = soce.dst.split('');
								dst[0] = dst[0].toUpperCase();
								dst = dst.join('');
								labels[j].text = labels[j].text.replace(new RegExp(src, 'g'), dst);
							}

							foundIndex = labels[j].text.toUpperCase().indexOf(soce.src.toUpperCase());
							if (foundIndex != -1)
								if ((labels[j].text[foundIndex] == labels[j].text[foundIndex].toUpperCase()) && (labels[j].text[foundIndex + 1] == labels[j].text[foundIndex + 1].toUpperCase()))
									labels[j].text = labels[j].text.replace(new RegExp(p + soce.src.toUpperCase() + s, 'g'), soce.dst.toUpperCase());

							foundIndex = labels[j].text.toLowerCase().indexOf(soce.src);
							if (foundIndex != -1)
								if ((labels[j].text[foundIndex] == labels[j].text[foundIndex].toLowerCase()) && (labels[j].text[foundIndex + 1] == labels[j].text[foundIndex + 1].toLowerCase()))
									labels[j].text = labels[j].text.replace(new RegExp(p + soce.src + s, 'g'), soce.dst);
						}
						foundIndex = labels[j].text.toLowerCase().indexOf(soce.src);
					}
				}
			}

			var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
			if (paytable.length > 0) {
				paytable = paytable[0];
				var targetTransform = paytable.transform.Find("Pages/Common_Info1/HowToPlay/Rules/Top/SpriteHolder/Rule1SpritePlus");
				if (targetTransform != null)
					targetTransform.localPosition(-340, -9.75, 0);

				targetTransform = paytable.transform.Find("Pages/Common_Info1/HowToPlay/Rules/Top/SpriteHolder/Rule1SpriteMinus");
				if (targetTransform != null)
					targetTransform.localPosition(-244, -9.75, 0);

				targetTransform = paytable.transform.Find("Pages/Common_Info1/MainGameInterface/Rules/Rule5/SpritesHolder/SpritePlus");
				if (targetTransform != null)
					targetTransform.localPosition(-515, -13, 0);

				targetTransform = paytable.transform.Find("Pages/Common_Info1/MainGameInterface/Rules/Rule5/SpritesHolder/SpriteMinus");
				if (targetTransform != null)
					targetTransform.localPosition(-392, -13, 0);
			}

			var paytableMobile = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);
			if (paytableMobile.length > 0) {
				paytableMobile = paytableMobile[0];
				var targetTransform = paytableMobile.transform.Find("Paytable_landscape/Common_Info1/Content/RealContent/HowToPlay/Rules/Rule1/SpriteHolder/Rule1SpritePlus");
				if (targetTransform != null)
					targetTransform.localPosition(102, -55.4, 0);

				targetTransform = paytableMobile.transform.Find("Paytable_landscape/Common_Info1/Content/RealContent/HowToPlay/Rules/Rule1/SpriteHolder/Rule1SpriteMinus");
				if (targetTransform != null)
					targetTransform.localPosition(224, -55.4, 0);

				targetTransform = paytableMobile.transform.Find("Paytable_landscape/Common_Info1/Content/RealContent/HowToPlay/Rules/Rule1/SpriteHolder/Rule1MobileBetIcon");
				if (targetTransform != null)
					targetTransform.localPosition(-356, -10, 0);
			}

			if (window["BJSoundLogic"] != undefined) {
				var bjsla = globalRuntime.sceneRoots[1].GetComponentsInChildren(BJSoundLogic, true);
				if (bjsla.length > 0) {
					bjsl = bjsla[0];

					bjsl.clipPlaceYourBets.clipMale.clipNormal = null;
					bjsl.clipPlaceYourBets.clipMale.clipFast = null;
					bjsl.clipPlaceYourBets.clipMale.clipInstant = null;

					bjsl.clipPlaceYourBets.clipFemale.clipNormal = null;
					bjsl.clipPlaceYourBets.clipFemale.clipFast = null;
					bjsl.clipPlaceYourBets.clipFemale.clipInstant = null;
				}
			}

		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchSocialUILabelText",
	ready: function () {
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (IsRequired("SOC")) {
			var SOC_replacements = {
				de: [{
					src: "um zwischen der ansicht\nder geld-",
					dst: "um zwischen\nder chips-"
				},
				{
					src: "geld",
					dst: "chips",
					wordonly: true
				},
				{
					src: "cash",
					dst: "chips"
				},
				{
					src: "geld",
					dst: "chips"
				},
				]
			};

			if (SOC_replacements[UHT_GAME_CONFIG_SRC.lang] != undefined) {
				var replacements = SOC_replacements[UHT_GAME_CONFIG_SRC.lang];
				var OnXTGameInit = function () {
					var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
					for (var i = 0; i < replacements.length; i++) {
						var soc = replacements[i];
						var p = soc.wordonly ? "\\b" : "";
						var s = soc.wordonly ? "\\b" : "";
						for (var j = 0; j < labels.length; j++) {
							var foundIndex = labels[j].text.toLowerCase().indexOf(soc.src);
							if (foundIndex != -1) {
								if (labels[j].text == labels[j].text.toLowerCase())
									labels[j].text = labels[j].text.replace(new RegExp(p + soc.src + s, 'g'), soc.dst);
								else if (labels[j].text == labels[j].text.toUpperCase())
									labels[j].text = labels[j].text.replace(new RegExp(p + soc.src.toUpperCase() + s, 'g'), soc.dst.toUpperCase());
								else {
									if ((labels[j].text[foundIndex] == labels[j].text[foundIndex].toUpperCase()) && (labels[j].text[foundIndex + 1] == labels[j].text[foundIndex + 1].toLowerCase())) {
										var src = soc.src.split('');
										src[0] = src[0].toUpperCase();
										src = src.join('');
										var dst = soc.dst.split('');
										dst[0] = dst[0].toUpperCase();
										dst = dst.join('');
										labels[j].text = labels[j].text.replace(new RegExp(src, 'g'), dst);
									}
									foundIndex = labels[j].text.toLowerCase().indexOf(soc.src);
									if (foundIndex != -1)
										if ((labels[j].text[foundIndex] == labels[j].text[foundIndex].toUpperCase()) && (labels[j].text[foundIndex + 1] == labels[j].text[foundIndex + 1].toUpperCase()))
											labels[j].text = labels[j].text.replace(new RegExp(p + soc.src.toUpperCase() + s, 'g'), soc.dst.toUpperCase());
									foundIndex = labels[j].text.toLowerCase().indexOf(soc.src);
									if (foundIndex != -1)
										if ((labels[j].text[foundIndex] == labels[j].text[foundIndex].toLowerCase()) && (labels[j].text[foundIndex + 1] == labels[j].text[foundIndex + 1].toLowerCase()))
											labels[j].text = labels[j].text.replace(new RegExp(p + soc.src + s, 'g'), soc.dst);
								}
							}
						}
					}
				}
				XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this);
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "Patch_Wurfl_VS_UAP",
	ready: function () {
		return (window["globalTracking"] != undefined);
	},
	apply: function () {
		if (window['WURFL'] != null && window["UHT_UA_INFO"] != null) {
			var device = UHT_UA_INFO.device;
			var mobile = device.type == "mobile" || device.type == "tablet";
			var UAPARSER_INFO = {
				MOBILE: mobile,
				DESKTOP: !mobile
			};

			var same = (UHT_DEVICE_TYPE.MOBILE == UAPARSER_INFO.MOBILE) && (UHT_DEVICE_TYPE.DESKTOP == UAPARSER_INFO.DESKTOP);
			globalTracking.SendEvent("DeviceInfo", same ? "_same_" : "_different_", 1, "RatingTracker");
			if (!same) {
				var stringToSend = "W_" + (UHT_DEVICE_TYPE.MOBILE ? "mobile" : "desktop") + "__UAP_" + (UAPARSER_INFO.MOBILE ? "mobile" : "desktop");
				globalTracking.SendEvent("DeviceInfoDiff", stringToSend, 1, "RatingTracker");
			}
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchTournamentsManager",
	ready: function () {
		return (window["TournamentsManager"] != undefined);
	},
	apply: function () {
		TournamentsManager.prototype.ShowTournaments = function () {
			if (!this.isEnabled)
				return;

			if (!this.isVisible) {
				var rankUID = XT.GetString(TournamentVars.RankPromotionID);
				var rankType = PromotionsHelper.GetPromotionType(rankUID);
				var menuType = XT.GetInt(TournamentVars.MenuPromotionType);
				var canSetUID = (menuType == TournamentProtocol.PromoType.Invalid || menuType == rankType) && TournamentsManager.showTournamentsFrame != Time.frameCount && !_string.IsNullOrEmpty(rankUID);
				TournamentsManager.showTournamentsFrame = Time.frameCount;

				XT.SetInt(TournamentVars.MenuPromotionType, TournamentProtocol.PromoType.Invalid);
				if (canSetUID && XT.GetString(TournamentVars.SelectedTournamentID) != rankUID)
					XT.SetString(TournamentVars.SelectedTournamentID, rankUID);

				XT.TriggerEvent(TournamentVars.Evt_Internal_PromotionsOpen);
				this.isVisible = true;
				this.StopRunningEvents();

				var cat = this.catShowTournaments;
				if (this.showOnlyDetailsIfOneTournament && this.visibleTournamentsCount == 1)
					cat = this.catShowTournamentDetails;

				cat.Start();

				if (TournamentsManager.updateDefaultView) {
					TournamentsManager.updateDefaultView = false;

					if (this.useDefaultViewCats) {
						cat = this.visibleTournamentsCount == 1 ? this.catDefaultViewSingle : this.catDefaultViewMultiple;
						cat.Start();

						var type = PromotionsHelper.GetPromotionType(XT.GetString(TournamentVars.SelectedTournamentID));
						var idx = this.defaultViewType.indexOf(type);

						if (idx > -1)
							this.catDefaultViewByType[idx].Start();
					}
				}
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchItsNotASlot",
	ready: function () {
		return (window["UHTEngine"] != undefined);
	},
	apply: function () {
		var accpyt = IsRequired("ACCPYT");
		var accpyt_odds = IsRequired("ACCPYT_ODDS");
		if (accpyt || accpyt_odds) {
			if (UHT_GAME_CONFIG != undefined && UHT_GAME_CONFIG.GAME_SYMBOL != undefined && UHT_GAME_CONFIG.GAME_SYMBOL.substr(0, 2) != "vs" && UHT_GAME_CONFIG.GAME_SYMBOL.substr(0, 2) != "sc")
				return;

			var container = document.createElement("div");
			container.style.position = "absolute";
			container.style.width = "100%";
			container.style.height = "100%";
			container.style.backgroundColor = "black";
			container.style.top = "0";
			container.style.left = "0";
			container.style.zIndex = "100";
			container.style.fontFamily = "'Roboto Condensed', sans-serif";
			container.id = "notaslot";

			var center = document.createElement("center");
			center.style.height = "90%"
			var title = document.createElement("h1");
			title.style.color = "white";
			title.style.fontSize = "5vh";
			title.textContent = "Bet - Symbol Prediction";

			var img = document.createElement("img");
			if (accpyt_odds)
				img.src = "/gs2c/lobby/icons/_splash/odds/" + UHT_GAME_CONFIG.GAME_SYMBOL + ".jpg";
			else
				img.src = "/gs2c/lobby/icons/_splash/" + UHT_GAME_CONFIG.GAME_SYMBOL + ".jpg";
			img.id = "image";
			img.style.maxWidth = "100%";
			img.style.maxHeight = "100%";

			var footer = document.createElement("div");
			footer.style.height = "15%";
			footer.style.width = "100%";
			footer.style.background = "black";
			footer.id = "footerContainer";

			var footerTitle = document.createElement("h2");
			footerTitle.style.color = "white";
			footerTitle.style.fontSize = "3vh";
			footerTitle.textContent = "Symbols predicted must result and display as per the dedicated paylines (if applicable) of the events in your game session.";

			var button = document.createElement("button");
			button.style.backgroundColor = "#4CAF50";
			button.style.border = "none";
			button.style.color = "white";
			button.style.padding = "15px 32px";
			button.style.textAlign = "center";
			button.style.textDecoration = "none";
			button.style.display = "inline-block";
			button.style.fontSize = "2vh";
			button.textContent = "I Accept";
			button.onclick = function () {
				container.remove();
			};
			var topContainer = document.createElement("div");
			topContainer.style.height = "15%";
			topContainer.id = "topContainer";
			var centerContainer = document.createElement("div");
			centerContainer.style.height = "60%";
			centerContainer.id = "centerContainer";

			footer.appendChild(footerTitle);
			footer.appendChild(button);
			topContainer.appendChild(title);
			center.appendChild(topContainer);
			centerContainer.appendChild(img);
			center.appendChild(centerContainer);
			center.appendChild(footer);
			container.appendChild(center);

			var oUHTE_SLIH = UHTEngine.SignalLoaderIsHidden;
			UHTEngine.SignalLoaderIsHidden = function () {
				oUHTE_SLIH.apply(this, arguments);
				document.body.appendChild(container);
			}
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchNetPosition",
	ready: function () {
		return (window["NetPositionFOX"] != undefined);
	},
	apply: function () {
		var purchaseCosts = [];
		if (window["EventManager"]) {
			var HandleServerRequest = function (request) {
				if (request.Fields["action"] != undefined && request.Fields["action"] == "doSpin") {
					var purchaseIndex = -1;
					if (request.Fields[GameProtocolDictionary.FreeSpinsPurchase.optionIndex] != null)
						purchaseIndex = parseInt(request.Fields[GameProtocolDictionary.FreeSpinsPurchase.optionIndex]);

					if (request.Fields[GameProtocolDictionary.FeaturePurchaseParam] != undefined)
						purchaseIndex = parseInt(request.Fields[GameProtocolDictionary.FeaturePurchaseParam]);

					if (purchaseIndex > -1 && (purchaseIndex < purchaseCosts.length)) {
						var fCost = purchaseCosts[purchaseIndex] * CoinManager.GetNextBet();
						var npfa = globalRuntime.sceneRoots[1].GetComponentsInChildren(NetPositionFOX, true);
						for (var i = 0; i < npfa.length; i++)
							npfa[i].featureCost = fCost;
					}
				}
			};
			EventManager.AddHandler(AdapterEvents.evtServerRequest, HandleServerRequest, this);
		}

		NetPositionFOX.prototype.XTRegisterCallbacks = function () {
			this.featureCost = 0;
			this.priority = 69;
			FOXLink.prototype.XTRegisterCallbacks.call(this);
		}

		NetPositionFOX.prototype.HandleInitResponse = function (param) {
			var fspc = VSProtocolParser.ParseFSPurchaseConfig(param);
			if (fspc != null) {
				if (fspc.purchaseOptions != null) {
					for (var i = 0; i < fspc.purchaseOptions.length; i++) {
						purchaseCosts.push(fspc.purchaseOptions[i].bet);
					}
				}
			}

			if (param["purInit"] != undefined) {
				var purInit = [];
				try {
					purInit = eval(param.purInit);
				} catch (err) { }

				if (purInit.length > 0) {
					for (var i = 0; i < purInit.length; i++) {
						purchaseCosts.push(purInit[i].bet);
					}
				}
			}
		};

		NetPositionFOX.prototype.SpinIsFree = function ( /**Object*/ dict) {
			if (XT.GetBool(Vars.Logic_IsFreeSpin))
				return true;

			if (XT.GetBool(Vars.IsDifferentSpinType)) {
				if (this.ignoreFirstTumble)
					this.ignoreFirstTumble = false;
				else
					return true;
			}

			var respinData = XT.GetObject(Vars.RespinData);
			var isRespin = respinData != null && !respinData.IsDone;
			if (isRespin && !XT.GetBool(Vars.IsDifferentSpinType)) {
				return true;
			}

			if (dict["tmb_res"] != undefined)
				return true;
			if (dict["rs_t"] != undefined && dict["na"] != undefined && dict["na"] == "c")
				return true;

			return false;
		}

		NetPositionFOX.prototype.DeductBet = function ( /**Object*/ dict) {
			var lines = -1;
			var coin = -1;
			if (dict[GameProtocolDictionary.line] != undefined)
				lines = _number.otoi(dict[GameProtocolDictionary.line]);
			else
				lines = XT.GetInt(Vars.BetToTotalBetMultiplier);

			if (dict[GameProtocolDictionary.coin] != undefined)
				coin = _number.otod(dict[GameProtocolDictionary.coin]);

			if (coin != -1 && lines != -1 && dict[GameProtocolDictionary.FreeRound.TotalWin] == undefined) {
				if (this.featureCost > 0) {
					this.currentNetPosition -= this.featureCost;
					this.featureCost = 0;
				} else
					this.currentNetPosition -= (coin * lines);
			}

			this.OnUpdateDisplayedWin();
		}

		NetPositionFOX.prototype.AddWin = function ( /**Object*/ dict) {
			if (dict[GameProtocolDictionary.NextActions.nextAction] != undefined && dict[GameProtocolDictionary.NextActions.nextAction].indexOf(GameProtocolDictionary.NextActions.Collect) >= 0) {
				this.currentNetPosition += this.lastTotalWin;
				this.lastTotalWin = 0;
			}
		}

		NetPositionFOX.prototype.HandleSpinResponse = function ( /**Object*/ dict) {
			if (dict[GameProtocolDictionary.spinCycleWin] != undefined)
				this.lastTotalWin = _number.otod(dict[GameProtocolDictionary.spinCycleWin]);

			if (!this.SpinIsFree(dict))
				this.DeductBet(dict);

			this.AddWin(dict);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchJurisdictionSessionUptime",
	ready: function () {
		return (window["JurisdictionSessionUptime"] != undefined);
	},
	apply: function () {
		JurisdictionSessionUptime.prototype.Awake = function () {
			if (UHT_GAME_CONFIG_SRC["s_elapsed"] != null) {
				this.currentTime = UHT_GAME_CONFIG_SRC["s_elapsed"] * 60;
				return;
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchOnBalanceUpdated",
	ready: function () {
		return (window["StageSpin"] != undefined);
	},
	apply: function () {
		var oSSOBU = StageSpin.prototype.OnBalanceUpdated;
		StageSpin.prototype.OnBalanceUpdated = function () {
			if (XT.GetDouble(TournamentVars.Promotion_WinReceived) <= 0) {
				oSSOBU.apply(this, arguments);
			}
			if (StageSpin.preventBalanceUpdate) {
				if (XT.GetDouble(Vars.BonusBalance) < 0.0001)
					XT.SetDouble(Vars.BalanceDisplayed, XT.GetDouble(Vars.BalanceDisplayed) - CoinManager.GetLastTotalBet());
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchRequirementMAC",
	ready: function () {
		return (window["UHT_GAME_CONFIG_SRC"] != undefined) && (window["TournamentVars"] != undefined) && (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (IsRequired("MAC")) {
			XT.SetBool(TournamentVars.PrizeDropManuallyCredited, true);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchAllowNL",
	ready: function () {
		return (window["ModificationsManager"] != undefined);
	},
	apply: function () {
		if (IsRequired("ALLOWNL")) {
			return;
		}

		if (window["UHT_CONFIG"].LANGUAGE == "nl")
			ModificationsManager.prototype.Init = function () { };
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchForgetFRBEndWindowOnInit",
	ready: function () {
		return (window["EventManager"] != undefined);
	},
	apply: function () {
		var OnUHTUpdate = function () {
			if (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"])
				return;

			if (IsRequired("FFE")) {
				XT.SetBool(Vars.DontShowFRBEndWindowOnInit, true);
			}

			EventManager.ClearCallback(OnUHTUpdate, this);
		}
		EventManager.AddHandler("EVT_UHT_UPDATE", OnUHTUpdate, this);
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchForgetPreviousWin",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UHT_GAME_CONFIG_SRC"] != undefined && window["VideoSlotsConnection"] != undefined);
	},
	apply: function () {
		if (IsRequired("FPW")) {
			VideoSlotsConnection.cleanupPreviousWin = true;
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchTournamentReloadInterval",
	ready: function () {
		return (window["TournamentConnectionXTLayer"] != undefined);
	},
	apply: function () {
		var oTCXTL_OGI = TournamentConnectionXTLayer.prototype.OnGameInit;
		TournamentConnectionXTLayer.prototype.OnGameInit = function () {
			oTCXTL_OGI.apply(this, arguments);
			if (this.connection != null) {
				this.connection.reloadLeaderboardsInterval = 120;
				this.connection.leaderboardsTimer = 120;
				this.connection.reloadTournamentsInterval = 120;
				this.connection.tournamentsTimer = 120;
				this.connection.reloadRaceWinnersInterval = 120;
				this.connection.raceWinnersTimer = 120;
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchNODEC",
	ready: function () {
		return (window["LocaleManager"] != undefined);
	},
	apply: function () {
		if (IsRequired("NODEC")) {
			var oLM_FV = LocaleManager.FormatValue;
			LocaleManager.FormatValue = function ( /**number*/ val, /**FormatOptions*/ formatInfo) {
				formatInfo.hasDecimals = false;
				return oLM_FV.apply(this, arguments);
			};
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchJR",
	ready: function () {
		return (window["VideoSlotsConnectionXTLayer"] != undefined);
	},
	apply: function () {
		var oVSCXTL_RS = VideoSlotsConnectionXTLayer.prototype.RequirementsSetup;
		VideoSlotsConnectionXTLayer.prototype.RequirementsSetup = function () {
			NOJRChecked = false;
			var a = IsRequired("UNUSED", false, true);
			oVSCXTL_RS.apply(this, arguments);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchRemoveTournamentCatchphraseItalian",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "it") {

			this.OnXTGameInit = function () {
				if (!Globals.isMobile) {
					var pathsDesktop = [
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/ShortRulesCombined/Catchphrase"
					];

					for (var i = 0; i < pathsDesktop.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
						if (t != null) {
							t.gameObject.SetActive(false);
						}
					}
				} else if (!Globals.isMini) {
					var pathsMobileLand = [
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/ShortCombined/Catchphrase"
					];

					var pathsMobilePort = [
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/ShortCombined/Catchphrase"
					];

					for (var i = 0; i < pathsMobileLand.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobileLand[i]);
						if (t != null) {
							t.gameObject.SetActive(false);
						}
					}

					for (var i = 0; i < pathsMobilePort.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobilePort[i]);
						if (t != null) {
							t.gameObject.SetActive(false);
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLocalization",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "tr") {

			this.OnXTGameInit = function () {
				if (!Globals.isMobile) {
					var pathsDesktop = [
						"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/FreeBonusRounds!Label",
						"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/Title/Label",
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/Texts/Prize/FRN/Amount/FreeBonusRoundsLabel!",
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/Texts/Prize/Bet/AtLabel"
					];

					var newTranslationDesktop = [
						"ÜCRETSİZ DÖNÜŞ KAZANDINIZ!",
						"OYNAMAYA BAŞLATMAK İÇİN DEVAM'A BASIN",
						"ŞANŞLISINIZ!",
						"ÜCRETSİZ DÖNÜŞ!",
						"BAHİS"
					];

					for (var i = 0; i < pathsDesktop.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
						if (t != null) {
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslationDesktop[i];
						}
					}
				} else if (!Globals.isMini) {
					var pathsMobileLand = [
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/FreeBonusRounds!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/FR/Texts/Prize/FRN/Amount/FreeBonusRoundsLabel!",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/FR/Texts/Prize/Bet/AtLabel"
					];

					var pathsMobilePort = [
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/FreeBonusRounds!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/FR/Texts/Prize/FRN/Amount/FreeBonusRoundsLabel!",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/FR/Texts/Prize/Bet/AtLabel"
					];

					var newTranslationMobile = [
						"ÜCRETSİZ DÖNÜŞ KAZANDINIZ!",
						"OYNAMAYA BAŞLATMAK İÇİN DEVAM'A BASIN",
						"ÜCRETSİZ DÖNÜŞ!",
						"BAHİS"
					];

					for (var i = 0; i < pathsMobileLand.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobileLand[i]);
						if (t != null) {
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslationMobile[i];
						}
					}

					for (var i = 0; i < pathsMobilePort.length; i++) {
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobilePort[i]);
						if (t != null) {
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslationMobile[i];
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}

		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "th") {

			this.OnXTGameInit = function () {
				var newTranslation = "ของรางวัลจำนวน";
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				if (!Globals.isMobile) {
					var pathsDesktop = [
						"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_AGBM/Title/Title/NoOfPrizesLabel"
					];

					for (var i = 0; i < pathsDesktop.length; i++) {
						var t = localizationRoot.transform.Find(pathsDesktop[i]);
						if (t != null) {
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslation;
						}
					}
				} else {
					var pathsMobile = [
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/Landscape/ScreenAnchor/Content/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/Landscape/ScreenAnchor/Content/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel"
					];

					for (var i = 0; i < pathsMobile.length; i++) {
						var t = localizationRoot.transform.Find(pathsMobile[i]);
						if (t != null) {
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslation;
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchRC_CheckShowWindow",
	ready: function () {
		return (window["RC_CheckShowWindow"] != undefined);
	},
	apply: function () {
		RC_CheckShowWindow = function () {
			if (RC_timer == -1)
				return;
			if (UHT_GAME_CONFIG["rcSettings"] == null)
				return;
			if (UHT_GAME_CONFIG["rcSettings"]["rctype"] != "RC0")
				return;
			if (IsRequired("RCEA") && (UHT_GAME_CONFIG["rcSettings"]["elapsed"] > UHT_GAME_CONFIG["rcSettings"]["interval"]))
				UHT_GAME_CONFIG["rcSettings"]["elapsed"] -= UHT_GAME_CONFIG["rcSettings"]["interval"];
			if (RC_WindowShown)
				return;
			var now = (new Date).getTime();
			var interval = UHT_GAME_CONFIG["rcSettings"]["interval"];
			var minutes_passed = ((now - RC_timer) / 6E4) + (UHT_GAME_CONFIG["rcSettings"]["elapsed"] || 0);
			var all_minutes_passed = Math.floor((now - RC_sessionTimer) / 6E4) | 0;
			if (minutes_passed >= interval) {
				SystemMessageManager.ShowMessage(SystemMessageType.ClientRegulation, false, UHT_GAME_CONFIG["rcSettings"]["msg"].replace("{0}", interval.toString()).replace("{1}", all_minutes_passed));
				UHT_GAME_CONFIG["rcSettings"]["elapsed"] = 0;
				RC_WindowShown = true
			}
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFRBEV",
	ready: function () {
		return (window["XT"] != undefined && window["XT"]["RegisterAndInitDone"]);
	},
	apply: function () {
		var isStart = false;
		var SendFRBEvent = function () {
			if (isStart)
				UHTInterfaceBOSS.PostMessage("FRB_STARTED");
			else
				UHTInterfaceBOSS.PostMessage("FRB_ENDED");
		}

		if (IsRequired("FRBEVS")) {
			var PrepareToSendStartEvent = function () {
				isStart = true;
			};

			if (Vars.Evt_DataToCode_BonusRoundsOnContinuePressed)
				XT.RegisterCallbackEvent(Vars.Evt_DataToCode_BonusRoundsOnContinuePressed, SendFRBEvent, this);
			if (Vars.Evt_CodeToData_BonusRoundsStarted)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_BonusRoundsStarted, PrepareToSendStartEvent, this);
			if (Vars.Evt_CodeToData_TimedBonusRoundsStarted)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_TimedBonusRoundsStarted, PrepareToSendStartEvent, this);
		}

		if (IsRequired("FRBEVE")) {
			var PrepareToSendEndEvent = function () {
				isStart = false;
			};

			if (Vars.Evt_DataToCode_BonusRoundsOnContinuePressed)
				XT.RegisterCallbackEvent(Vars.Evt_DataToCode_BonusRoundsOnContinuePressed, SendFRBEvent, this);
			if (Vars.Evt_CodeToData_BonusRoundsFinished)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_BonusRoundsFinished, PrepareToSendEndEvent, this);
			if (Vars.Evt_CodeToData_TimedBonusRoundsFinished)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_TimedBonusRoundsFinished, PrepareToSendEndEvent, this);
		}
	},
	retry: function () {
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	}
});

UHTPatch({
	name: "PatchSlider",
	ready: function () {
		return (window["Slider"] != undefined);
	},
	apply: function () {
		Slider.prototype.Autocomplete = function () {
			if (this.autocomplete) {
				if (this.type == SliderType.Bool) {
					var targetValue = this.internalValue >= 0.5 ? 1 : 0;
					var value = UHTMath.inverseLerp(this.thumb.localPositionLimitMin.x, this.thumb.localPositionLimitMax.x, this.thumb.target.localPosition().x);

					if (targetValue != value) {
						this.animator.manualTo = this.internalValue >= 0.5 ? this.thumb.localPositionLimitMax : this.thumb.localPositionLimitMin;
						this.animator.animationTime = this.animationTime * Math.abs(targetValue - value);
						this.animator.Play();
					}
				}
			}

			this.autocompleteFrameCount = Time.frameCount;
		};

		Slider.prototype.InverseAutocomplete = function () {
			if (this.autocomplete && this.autocompleteFrameCount != Time.frameCount) {
				if (this.type == SliderType.Bool) {
					var targetValue = this.internalValue >= 0.5 ? 0 : 1;
					var value = UHTMath.inverseLerp(this.thumb.localPositionLimitMin.x, this.thumb.localPositionLimitMax.x, this.thumb.target.localPosition().x);

					if (targetValue != value) {
						this.animator.manualTo = targetValue == 1 ? this.thumb.localPositionLimitMax : this.thumb.localPositionLimitMin;
						this.animator.animationTime = this.inverseAnimationTime * Math.abs(targetValue - value);
						this.animator.Play();
					}
				}
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchWalletAwareSB",
	ready: function () {
		return (window["RequestManager"] != undefined && window["RequestManager"].MustLimitSpinRequest != undefined);
	},
	apply: function () {
		if (IsRequired("WASB")) {
			var oRMMLSR = RequestManager.MustLimitSpinRequest;
			RequestManager.MustLimitSpinRequest = function () {
				XT.SetFloat(Vars.SpinDuration, 0);
				return oRMMLSR.apply(this, arguments);
			}
		};
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchAGCC_73839",
	ready: function () {
		return (window["AGCCController"] != undefined);
	},
	apply: function () {
		AGCCController.prototype.Update = function () {
			if (UHT_GAME_CONFIG != null) {
				this.shouldShow = UHT_GAME_CONFIG["jurisdictionMsg"] == "imageAGCC";
				this.image.SetActive(this.shouldShow);
			}

			if (this.shouldShow) {
				var myCamera = Globals.GetCameraForObject(this.image);
				if (myCamera != null) {
					var posOnScreen = new UHTMath.Vector3(0, 0, 0);
					posOnScreen.y = UHTScreen.height;
					var posOnWorld = myCamera.ScreenToWorldPoint(posOnScreen);
					var pos = this.image.transform.position();
					this.image.transform.position(pos.x, posOnWorld.y + 0.05, pos.z);
				}

				if (UHTScreen.width >= UHTScreen.height * 1.4) {
					this.image.transform.localScale(2.1, 2.1, 2.1);
				} else if (UHTScreen.width >= UHTScreen.height) {
					this.image.transform.localScale(1.7, 1.7, 1.7);
				} else if (UHTScreen.width < UHTScreen.height) {
					this.image.transform.localScale(1.05, 1.05, 1.05);
				}

				var clientLoader = globalRuntime.sceneRoots[0].GetComponentsInChildren(ClientLoader)[0];
				clientLoader.transform.localScale(0.6, 0.6, 0.6);
				clientLoader.transform.localPosition(0, 30, 0);
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchSplitResponseContent",
	ready: function () {
		return (window["GameProtocolCommonParser"] != undefined);
	},
	apply: function () {
		GameProtocolCommonParser.SplitResponseContent = function (nameValues) {
			var mapNameValues = {};
			for (var i = 0; i < nameValues.length; ++i) {
				var nameValueSplitted = nameValues[i].split('=', 2);
				if (nameValueSplitted.length == 2) {
					nameValueSplitted[1] = nameValues[i].split("=").slice(1).join("=");
					if (mapNameValues[nameValueSplitted[0]] == undefined)
						mapNameValues[nameValueSplitted[0]] = nameValueSplitted[1];
				}
			}
			return mapNameValues;
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchBonusBalanceEvent",
	ready: function () {
		return (window["VideoSlotsConnectionXTLayer"] != undefined && window["VSProtocolParser"].ParseVsResponse != undefined);
	},
	apply: function () {
		if (window["UHTInterfaceBOSS"].enabled && window.top != window) {
			var hadBonusBalance = undefined;
			var oPVR = VSProtocolParser.ParseVsResponse;
			VSProtocolParser.ParseVsResponse = function () {
				var hasBonusBalance = (arguments[0].balance_bonus > 0);
				if ((hasBonusBalance && hadBonusBalance != true) || (!hasBonusBalance && hadBonusBalance != false)) {
					var msg = "";
					if (hasBonusBalance)
						msg = "bonusBalanceAvailable";
					if (!hasBonusBalance)
						msg = "bonusBalanceUnavailable";

					hadBonusBalance = hasBonusBalance;

					var args = {
						sender: URLGameSymbol,
						lang: UHT_GAME_CONFIG["LANGUAGE"].toUpperCase(),
						success: true,
						name: msg,
						event: msg
					}

					UHTInterfaceBOSS.PostMessageRec(window.parent, args);
				}
				return oPVR.apply(this, arguments);
			}
		};
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchGameHistoryEvent",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply: function () {
		if (IsRequired("GHEV")) {
			UHTInterfaceBOSS.HandleGameHistory = function () {
				UHTInterfaceBOSS.PostMessage("OPEN_HISTORY");
				return true;
			};
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchHideGameHistory",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply: function () {
		if (IsRequired("NOGH")) {
			if (window["Vars"] != undefined && window["Vars"]["Jurisdiction_GameHistoryInfoVisible"] != undefined)
				XT.SetBool(Vars.Jurisdiction_GameHistoryInfoVisible, false);
			var gameHistoryButtons = globalRuntime.sceneRoots[1].GetComponentsInChildren(GameHistoryButton, true);
			for (var i = 0; i < gameHistoryButtons.length; i++) {
				gameHistoryButtons[i].gameObject.SetActive(false);
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchRealityCheckEvents",
	ready: function () {
		return (window["SystemMessageManager"] != undefined) && (window["SystemMessageManager"]["RCClose"] != undefined) &&
			(window["SystemMessageManager"]["RCContinue"] != undefined) && (window["SystemMessageManager"]["ShowMessage"] != undefined);
	},
	apply: function () {
		var oSMMRCContinue = SystemMessageManager.RCContinue;
		SystemMessageManager.RCContinue = function () {
			UHTInterfaceBOSS.PostMessage("RC_CONTINUE");
			oSMMRCContinue.apply(this, arguments);
		}

		var oSMMRCClose = SystemMessageManager.RCClose;
		SystemMessageManager.RCClose = function () {
			UHTInterfaceBOSS.PostMessage("RC_QUIT");
			oSMMRCClose.apply(this, arguments);
		}

		var oSMMShowMessage = SystemMessageManager.ShowMessage;
		SystemMessageManager.ShowMessage = function (type, unlogged, text, args, customMsg) {
			if (type == SystemMessageType.ClientRegulation)
				UHTInterfaceBOSS.PostMessage("RC_SHOWN");

			oSMMShowMessage.apply(this, arguments);
		}

	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchHideCurrency",
	ready: function () {
		return (window["Adapter"] != undefined);
	},
	apply: function () {
		if (IsRequired("NOCUR")) {
			var oA_HGC = Adapter.prototype.HandleGetConfiguration;
			Adapter.prototype.HandleGetConfiguration = function () {
				oA_HGC.apply(this, arguments);
				ServerOptions.currency = "GNR";
			};
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDisableHomeButtonMobile",
	ready: function () {
		return (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1) && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply: function () {
		var shouldDisable = false;
		var styleNameList = "wkl_wynn383,wkl_mxm,396_ao99,oryxsw_zlatnik,btsn_supercasino,btsn_jackpot247,btsn_casinoeuro,btsn_jallacasino,btsn_liveroulette,btsn_mobilbahis,btsn_betsafe,btsn_betsafeee,btsn_betsafelv,btsn_betsafede,btsn_betsafese,btsn_betsson,btsn_betssones,btsn_betssongr,btsn_betssonde,btsn_betssonse,btsn_casinodk,btsn_europebet,btsn_nordicbet,btsn_nordicbetdk,btsn_nordicbetde,btsn_nordicbetse".split(",");
		for (var i = 0; i < styleNameList.length; i++) {
			if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i]) {
				shouldDisable = true;
				break;
			}
		}

		if (UHT_GAME_CONFIG.STYLENAME.indexOf("weinet_") > -1)
			shouldDisable = true;

		if (UHT_GAME_CONFIG.STYLENAME.indexOf("ggn_") > -1)
			shouldDisable = true;

		if (IsRequired("NOHB"))
			shouldDisable = true;

		if (shouldDisable) {
			if (Globals.isMobile) {
				var OnNotification = function (notification) {
					if (notification == null || notification.buttons == null)
						return;

					for (var i = 0; i < notification.buttons.length; i++) {
						if (notification.buttons[i].id == "BtCLOSE" || notification.buttons[i].action == "quit") {
							notification.buttons.splice(i, 1);
							break;
						}
					}
					XT.SetObject(CustomNotificationVars.CustomNotification, notification);
				}
				XT.RegisterCallbackObject(CustomNotificationVars.CustomNotification, OnNotification, this, -1);

				if (window["MenuWindowControllerMobile"] == undefined)
					return;
				var menus = globalRuntime.sceneRoots[1].GetComponentsInChildren(MenuWindowControllerMobile, true);
				for (var i = 0; i < menus.length; ++i) {
					var go = menus[i].transform.Find("Content/Home");
					if (go != null)
						go.gameObject.SetActive(false);
					else {
						menus[i].transform.Find("Content/Links/WithoutPromoUrl/Home").gameObject.SetActive(false);
						menus[i].transform.Find("Content/Links/WithPromoUrl/Home").gameObject.SetActive(false);
						go = menus[i].transform.Find("Content/Lines")
						if (go != null)
							go.gameObject.SetActive(false);
						go = menus[i].transform.Find("Content/Links/Lines")
						if (go != null)
							go.gameObject.SetActive(false);
					}
				}
				XT.SetBool(Vars.Jurisdiction_GameLobbyInfoVisible, false);
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchScrollableListOnDisable",
	ready: function () {
		return (window["ScrollableList"] != undefined);
	},
	apply: function () {
		ScrollableList.prototype.OnDisable = function () {
			if (this.wasPressed)
				this.OnPress(false);
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchIOSShadows",
	ready: function () {
		return (window["UILabel"] != undefined);
	},
	apply: function () {
		var needsPatch = (window["safari"] != undefined) || (document.documentElement.className.indexOf("iOS") >= 0);
		if (!needsPatch)
			return;

		var oUILI = UILabel.prototype.init;
		UILabel.prototype.init = function () {
			if (this.mOutline == true)
				this.mBlurShadow = false;
			oUILI.apply(this, arguments);
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTimedFreeRoundBonusManager",
	ready: function () {
		return (window["TimedFreeRoundBonusManager"] != undefined);
	},
	apply: function () {
		TimedFreeRoundBonusManager.prototype.OnBonusRoundsData = function (obj) {
			this.bonusRoundsData = obj;
			if (obj == null)
				return;

			if (this.bonusRoundsData.Type != VsFreeRound.RoundType.Timed)
				return;

			var evts = XT.GetObject(Vars.BonusRoundsEvents);
			if (evts != null) {
				for (var i = 0; i < evts.length; i++) {
					if (evts[i].Type == VsFreeRoundEvent.EventType.Start) {
						this.cachedStartEvent.push(evts[i].Clone());
						var foxResponse = XT.GetObject(FOXVars.FOX_Response);
						if (foxResponse != undefined && foxResponse["c"] != undefined)
							this.cachedbetLevel = parseFloat(foxResponse["c"]);
						XT.SetBool(Vars.ShouldIgnoreNextFinishEventFromServer, true);
						var fsr = XT.GetObject(Vars.ReceivedFreeSpinsResponse);
						if (evts.length == 1 && !fsr.IsLastFreeSpin)
							this.RequestToShow();
						XT.SetDouble(Vars.BonusRoundEndDateTimestamp, evts[i].EndDateTimestamp);
						if (evts != null && evts.length == 1 && evts[0].Type == VsFreeRoundEvent.EventType.Start && !evts[0].IsFreeRoundPending) {
							this.countingInBackground = true;
							this.currentTime = this.bonusRoundsData.RoundsLeft;
						}
					}
				}
			}
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchGBets",
	ready: function () {
		return (window["globalRuntime"] != undefined && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply: function () {
		if (IsRequired("GBETS")) {
			var oCCVACB = CoinManager.ComputeCoinValuesAndCurrentBet;
			CoinManager.ComputeCoinValuesAndCurrentBet = function (betsFromServer, lastBet, defaultBet) {
				var minBet = betsFromServer[0];
				var maxBet = betsFromServer[betsFromServer.length - 1];
				var curve = [0.05, 0.1, 0.2, 0.4];

				var levels = 10;

				while ((minBet * levels) < ((maxBet / levels) * curve[0]))
					curve.unshift(curve[0] * 0.2);

				if (maxBet / minBet < levels) {
					levels = ((maxBet * 1000) / (minBet * 1000)) | 0;
				}

				var maxCoinValue = ((maxBet * 1000) / levels) / 1000;
				var x = (maxCoinValue - minBet);

				var coinValues = [];
				coinValues.push(minBet);
				for (var j = 0; j < curve.length; j++) {
					var computedVal = CoinManager.GetNiceCoinValue(minBet + x * curve[j]);
					if ((computedVal > minBet) && (computedVal < maxCoinValue))
						coinValues.push(computedVal);
				}
				coinValues.push(maxCoinValue);

				for (var i = 1; i < coinValues.length; i++) {
					if (Math.abs(coinValues[i] - coinValues[i - 1]) < 1e-3) {
						coinValues.splice(i, 1);
						i--;
					}
				}

				var generatedBets = [];
				for (var levelIndex = 1; levelIndex <= levels; levelIndex++) {
					for (var i = 0; i < coinValues.length; i++) {
						var value = levelIndex * (coinValues[i] * 100) / 100;
						if (generatedBets.indexOf(value) == -1)
							generatedBets.push(value);
					}
				}
				generatedBets = generatedBets.sort(function (a, b) {
					return a - b
				});
				arguments[0] = generatedBets;
				oCCVACB.apply(this, arguments);
			};
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchNOST_SB",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["StageSpin"] != undefined);
	},
	apply: function () {
		StageSpin.prototype.OnPressedStop = function () {
			if (XT.GetBool(Vars.AllowFastStop) && !XT.GetBool(Vars.DisableStopButton))
				XT.TriggerEvent(Vars.Evt_Internal_ReelManager_StopSpin);
		};

	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideBETMENUjakr",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && (UHT_GAME_CONFIG_SRC["lang"] == "ja" || UHT_GAME_CONFIG_SRC["lang"] == "ko")) {
			var t = globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/Paytable/Pages/Common_Info2/BetMenu/Title/BetMenuLabel");
			if (t != null)
				t.gameObject.SetActive(false);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchConvertLeaderboardToPlayerCurrency",
	ready: function () {
		return (window["TournamentConnection"] != undefined);
	},
	apply: function () {
		var oCLTPC = TournamentConnection.prototype.ConvertLeaderboardToPlayerCurrency;
		TournamentConnection.prototype.ConvertLeaderboardToPlayerCurrency = function () {
			if (!arguments[0]["leaderboard"])
				return;
			oCLTPC.apply(this, arguments);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideFullScreenAfter5Seconds",
	ready: function () {
		return (window["IPhone8Helper"] != undefined);
	},
	apply: function () {
		if (FullScreenIPhoneHelper.USING_NEW_IMPLEMENTATION) {
			var oRH = IPhone8Helper.prototype.ResizeHandler;
			IPhone8Helper.prototype.ResizeHandler = function (e) {
				oRH.call(this);
				if ((UHT_UA_INFO != undefined) && (UHT_UA_INFO.os.version.split(".")[0] >= 15)) {
					if (this.root != null) {
						this.UpdateStyle(false);
						UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({
							common: "EVT_FULLSCREEN_OVERLAY_HIDDEN",
							args: null
						}));
					}
				}
			};
			return;
		}
		IPhone8Helper.prototype.ResizeHandler = function (e) {
			var self = this;

			if (!this.GameStarted()) {
				setTimeout(function () {
					self.ResizeHandler()
				}, 100);
				return;
			}

			if (this.root == null)
				this.InitElements();

			var wasLandscape = this.isLandscape;
			this.isLandscape = window.innerWidth > window.innerHeight;

			if (!this.isTouch) {
				if (wasLandscape == this.isLandscape) {
					if (this.panelHiddenTime > 0) {
						if (Date.now() - this.panelHiddenTime < 69) {
							setTimeout(function () {
								self.ResizeHandler(e);
							}, 500);
							return;
						}
					}
				} else {
					if (this.isLandscape && window.innerHeight != Math.min(screen.width, screen.height)) {
						this.UpdateStyle(true);
						this.UpdateScrollable(true);
						UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({
							common: "EVT_FULLSCREEN_OVERLAY_SHOWN",
							args: null
						}));
						this.panelHiddenTime = -1;
						if (!this.isLandscape)
							this.QueueFullscreenHide();
						else if (timeoutOrientationChanged != null)
							clearTimeout(timeoutOrientationChanged);
					}
					this.ResetScroll();
				}
			}

			var screenHeight = this.isLandscape ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height) - 60;
			if (!this.isLandscape && screenHeight == 752)
				screenHeight -= 35;
			if (!this.isLandscape && screenHeight == 836)
				screenHeight -= 4;

			this.clientHeight = this.GetClientHeight();

			var wasTopPanel = this.isTopPanel;
			this.isTopPanel = this.clientHeight < screenHeight;

			if (this.isTopPanel) {
				if (!wasTopPanel) {
					this.UpdateStyle(true);
					this.ResetScroll();
					this.UpdateScrollable(true);
					UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({
						common: "EVT_FULLSCREEN_OVERLAY_SHOWN",
						args: null
					}));
					this.panelHiddenTime = -1;
					if (!this.isLandscape)
						this.QueueFullscreenHide();
					else if (timeoutOrientationChanged != null)
						clearTimeout(timeoutOrientationChanged);
				}
			} else {
				if (wasTopPanel) {
					this.UpdateStyle(false);
					UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({
						common: "EVT_FULLSCREEN_OVERLAY_HIDDEN",
						args: null
					}));
					this.panelHiddenTime = Date.now();
				}
				this.UpdateScrollable(false);
			}

			if (e !== undefined)
				setTimeout(function () {
					self.ResizeHandler();
				}, 500);
		};

		var timeoutOrientationChanged = null;
		IPhone8Helper.prototype.QueueFullscreenHide = function () {
			var self = this;
			if (timeoutOrientationChanged != null)
				clearTimeout(timeoutOrientationChanged);

			timeoutOrientationChanged = setTimeout(self.HideFullScreen, 3000, self);
		};

		IPhone8Helper.prototype.HideFullScreen = function (obj) {
			obj.UpdateStyle(false);
			UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({
				common: "EVT_FULLSCREEN_OVERLAY_HIDDEN",
				args: null
			}));
			obj.panelHiddenTime = Date.now();
			obj.UpdateScrollable(false);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchBonusRoundsStartWindowContinueLabel",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		this.OnBonusRoundCanBePlayedLater = function (value) {
			var paths = [
				"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinue"
			];
			for (var i = 0; i < paths.length; i++) {
				var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
				if (t != null)
					t.gameObject.SetActive(!value);
			}

			paths = [
				"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label"
			];
			for (var i = 0; i < paths.length; i++) {
				var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
				if (t != null)
					t.gameObject.SetActive(false);
			}
		}
		XT.RegisterCallbackBool(Vars.BonusRoundCanBePlayedLater, this.OnBonusRoundCanBePlayedLater, this);
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchBonusRoundStartWindowLandscapeMobile",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		var paths = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Buttons/PlayLater/ContinueButton",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Buttons/PlayLater/ContinueLabel"
		];
		for (var i = 0; i < paths.length; i++) {
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null)
				t.gameObject.transform.SetParent(t.transform.parent.parent.transform, true);
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchClock",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs") == 0) {
			if (!Globals.isMini) {
				if (UHT_GAME_CONFIG.STYLENAME.indexOf("genesis_") == 0 || UHT_GAME_CONFIG.STYLENAME.indexOf("em_") == 0 || IsRequired("ALTCLK")) {
					var clockDisplayers = globalRuntime.sceneRoots[1].GetComponentsInChildren(ClockDisplayer, true);
					for (var j = 0; j < clockDisplayers.length; j++) {
						clockDisplayers[j].hoursLabel.effectStyle = 2;
						clockDisplayers[j].hoursLabel.effectHeight = 2;
						clockDisplayers[j].hoursLabel.effectWidth = 2;
						clockDisplayers[j].hoursLabel.init(true);
						clockDisplayers[j].separatorLabel.effectStyle = 2;
						clockDisplayers[j].separatorLabel.effectHeight = 2;
						clockDisplayers[j].separatorLabel.effectWidth = 2;
						clockDisplayers[j].separatorLabel.init(true);
						clockDisplayers[j].minutesLabel.effectStyle = 2;
						clockDisplayers[j].minutesLabel.effectHeight = 2;
						clockDisplayers[j].minutesLabel.effectWidth = 2;
						clockDisplayers[j].minutesLabel.init(true);
					}
				}
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHidePressSpinLabelDesktop",
	ready: function () {
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		var t = globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/Paytable/Pages/Common_Info1/HowToPlay/Rules/Bottom/Rule2Label");
		if (t != null)
			t.gameObject.SetActive(false);
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchDisableSpacebarSpin",
	ready: function () {
		return (window["Input"] != undefined);
	},
	apply: function () {
		if (IsRequired("NOKEY") || (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1)) {
			Input.GetKeyDown = function (keyCode) {
				return false;
			};

			Input.GetKey = function (keyCode) {
				return false;
			};
			if (!Globals.isMobile) {
				if (window["GUIMessageTurboSpin"] != undefined)
					GUIMessageTurboSpin.prototype.Show = function () {
						if (this.messages != null && this.messages.length > 0) {
							var i = Random.Range(0, this.messages.length);
							this.label.text = this.messages[i];
						}

						this.gameObject.SetActive(true);
					};
			}
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDisableFastPlayAndStopButton",
	ready: function () {
		return (window["VideoSlotsConnectionXTLayer"] != undefined);
	},
	apply: function () {
		if (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1) {
			var oVSCXTL_RS = VideoSlotsConnectionXTLayer.prototype.RequirementsSetup;
			VideoSlotsConnectionXTLayer.prototype.RequirementsSetup = function () {
				ServerOptions.brandRequirements += ",NOST,NOFP";
				oVSCXTL_RS.apply(this, arguments);
			};
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchHideVolatilityInfo",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && UHT_GAME_CONFIG_SRC["region"] == "Asia") {
			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
			if (localizationRoot != null) {
				var transforms = localizationRoot.GetComponentsInChildren(Transform, true);
				for (var i = 0; i < transforms.length; i++) {
					if (transforms[i].gameObject.name.indexOf("VolatilityMeter") > -1)
						transforms[i].gameObject.SetActive(false);
				}
			}

			var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
			if (paytable.length == 0)
				paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);

			if (paytable.length > 0) {
				var transforms = paytable[0].GetComponentsInChildren(Transform, true);
				for (var i = 0; i < transforms.length; i++) {
					if (transforms[i].gameObject.name.indexOf("VolatilityMeter") > -1) {
						if (transforms[i].parent != null)
							if (transforms[i].parent.gameObject.name != "RealContent")
								transforms[i].parent.gameObject.SetActive(false);
							else
								transforms[i].gameObject.SetActive(false);
					}

					if (transforms[i].gameObject.name.indexOf("VolatilityRuleLabel") > -1) {
						transforms[i].gameObject.SetActive(false);
					}
				}
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideRTPInfo",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function () {
		var mustApply = false;
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && UHT_GAME_CONFIG_SRC["region"] == "Asia")
			mustApply = true;
		if (UHT_GAME_CONFIG.STYLENAME.indexOf("weinet_") > -1)
			mustApply = true;
		var extrastylenames = ["ggn_ggpoker", "ggn_ggpokerok"];
		if (extrastylenames.indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
			mustApply = true;


		var stylenames = ["solidrdge_intercasino", "solidrdge_verajohn", "solid2_verajohn", "nkt_10bet", "nkt_baazi247", "nkt_bangbangcasino", "nkt_bollytech", "nkt_rtsm", "nkt_unikrn", "bv10", "bv8", "bv9", "bv2", "bv6", "bv15", "bv7", "hg_casitabi", "hg_casinome", "hg_purecasino", "hg_simplecasinojp", "hub88_hub88asia", "hub88_hub88slotsb2basia", "btcnst_vbetasia"];
		if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
			mustApply = false;

		if (IsRequired("ALTNFO"))
			mustApply = true;

		if (IsRequired("FORCENFO"))
			mustApply = false;

		if (mustApply) {
			var gameHasRTPInfoSelector = window["RTPInfoSelector"] != undefined;
			if (gameHasRTPInfoSelector) {
				this.OnXTGameInit = function () {
					var rtpInfoTargets = globalRuntime.sceneRoots[1].GetComponentsInChildren(RTPInfoSelector, true);
					for (var i = 0; i < rtpInfoTargets.length; i++) {
						rtpInfoTargets[i].gameObject.SetActive(false);
					}
				}
				XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
			} {
				var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
				if (paytable.length == 0)
					paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);

				if (paytable.length == 0 && window["SCPaytable"])
					paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(SCPaytable, true);

				if (paytable.length > 0) {
					if (window["VarDisplayer"]) {
						var rtpVarDisplayer = paytable[0].GetComponentsInChildren(VarDisplayer, true);
						for (var i = 0; i < rtpVarDisplayer.length; i++) {
							if (rtpVarDisplayer[i].variable.name == "ReturnToPlayer" || rtpVarDisplayer[i].variable.name == "ReturnToPlayerWithJackpot" || rtpVarDisplayer[i].variable.name == "ReturnToPlayerMinWithJackpot") {
								rtpVarDisplayer[i].label.transform.parent.gameObject.SetActive(false);
							}
						}
					}

					if (window["ValueDisplayer"]) {
						var rtpValueDisplayer = paytable[0].GetComponentsInChildren(ValueDisplayer, true);
						for (var i = 0; i < rtpValueDisplayer.length; i++) {
							if (rtpValueDisplayer[i].actualVarName == "ReturnToPlayer" || rtpValueDisplayer[i].actualVarName == "ReturnToPlayerWithJackpot" || rtpValueDisplayer[i].actualVarName == "ReturnToPlayerMinWithJackpot") {
								rtpValueDisplayer[i].label.transform.parent.gameObject.SetActive(false);
							}
						}
					}

					if (window["AddVariablesToText"]) {
						var rtpAddVariablesToText = paytable[0].GetComponentsInChildren(AddVariablesToText, true);
						for (var i = 0; i < rtpAddVariablesToText.length; i++) {
							for (var j = 0; j < rtpAddVariablesToText[i].someVariables.length; j++) {
								if (rtpAddVariablesToText[i].someVariables[j].variable.name == "ReturnToPlayer" ||
									rtpAddVariablesToText[i].someVariables[j].variable.name == "ReturnToPlayerWithJackpot" ||
									rtpAddVariablesToText[i].someVariables[j].variable.name == "ReturnToPlayerMinWithJackpot" ||
									rtpAddVariablesToText[i].someVariables[j].gameInfo_Name == "rtps"
								) {
									rtpAddVariablesToText[i].baseLabel.gameObject.SetActive(false);
								}
							}
						}
					}
				}
			}
		}
	},
	retry: function () {
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchRemoveDemoLabel",
	ready: function () {
		return (window["DemoLabelPosition"] != undefined);
	},
	apply: function () {
		DemoLabelPosition.prototype.OnGameInit = function () { };
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDontSendOpenCashierEvent",
	ready: function () {
		return (window["UHT_GAME_CONFIG"] != undefined);
	},
	apply: function () {
		var stylenames = ["888_888casinouk", "888_888casinoit", "888_888casinoes", "888_888casinodk", "888_888casinose", "888_888casinoro", "888_888casinopt", "888_888casinocom"];

		if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
			window["UHT_DISABLEOPENCASHIEREVENT"] = true;
	},
	retry: function () {
		return true;
	}
});

UHTPatch({
	name: "PatchSMMCloseGameEvent",
	ready: function () {
		return (window["SystemMessageManager"] != undefined) && (window["SystemMessageManager"]["CloseGame"] != undefined);
	},
	apply: function () {
		var oSMMCG = SystemMessageManager.CloseGame;
		SystemMessageManager.CloseGame = function () {
			UHTInterfaceBOSS.PostMessage("gameQuit");
			oSMMCG.apply(this, arguments);
		}
	},
	retry: function () {
		return true;
	}
});

UHTPatch({
	name: "PatchSRMIframe",
	ready: function () {
		return (window["SwedishRegulationManager"] != undefined);
	},
	apply: function () {
		SwedishRegulationManager.prototype.OnUHTResize = function ( /**Object*/ unused) {
			var canv = document.getElementsByTagName("canvas")[0];
			var rgsParent = document.getElementsByClassName("RGSContainerActive")[0].dataset;
			var pixelRatio = UHTScreen.height / window.innerHeight;
			var scale = 1 - (rgsParent.height * pixelRatio / UHTScreen.height);
			var sign = (document.documentElement.className.indexOf("iPhone") >= 0 && document.documentElement.id == "Mobile" && window.orientation == 90 && !window.frameElement) ? 1 : -1;
			var transY = sign * ((rgsParent.height * pixelRatio / (UHTScreen.height - rgsParent.height * pixelRatio)) / 2) * 100;
			canv.style.transform = "scale(" + scale + ") translateY(" + transY + "%)";
		};
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
	interval: 100
});

var NOJRChecked = false;

function IsRequired(requirement, justCheck, useServerOptions) {
	if (window["UHT_GAME_CONFIG_SRC"] == undefined)
		return false;

	if (!NOJRChecked) {
		NOJRChecked = true;
		if (IsRequired("NOJR", true)) {
			window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements = "";
			window["UHT_GAME_CONFIG"].jurisdictionRequirements = "";
		}
	}

	var isRequired = false;

	var reqs = (window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements + "," + window["UHT_GAME_CONFIG_SRC"].brandRequirements).split(',');
	if (useServerOptions)
		reqs = (ServerOptions.jurisdictionRequirements + "," + ServerOptions.brandRequirements).split(',');

	if ((window["UHT_GAME_CONFIG_SRC"]["replayMode"] == true) || (window["UHT_GAME_CONFIG_SRC"]["demoMode"])) {
		reqs.push("-SHONP");
		reqs.push("-SISU");
	}

	var reqs_processed = [];
	var reqs_delete = [];
	for (var i = 0; i < reqs.length; ++i) {
		if ((reqs[i] == "") || (reqs[i] == "undefined"))
			continue;

		var req = reqs[i];
		var splits = req.split("*");
		if (splits.length > 1) {
			var isMini = window["UHT_GAME_CONFIG_SRC"]["minimode"] == '1';
			var isMobile = UHT_DEVICE_TYPE.MOBILE == true;
			var platform = (isMini ? "MINI_" : "") + (isMobile ? "MOBILE" : "DESKTOP");
			if (splits[1] == platform)
				req = splits[0];
		}

		splits = req.split("~");
		if (splits.length > 1) {
			var currencies = splits[1].split(";");
			for (var cIdx = 0; cIdx < currencies.length; cIdx++) {
				if (currencies[cIdx] == window["UHT_GAME_CONFIG_SRC"].currency)
					req = splits[0];
			}
		}
		splits = req.split("]");
		if (splits.length > 1)
			if (req == "[" + window["UHT_GAME_CONFIG_SRC"].jurisdiction + "]" + splits[1])
				req = splits[1];

		if (justCheck)
			if (req == requirement)
				return true;

		reqs_processed.push(req);

		if (req[0] == '-')
			reqs_delete.push(req);
	}

	if (justCheck)
		return false;

	for (var d = 0; d < reqs_delete.length; ++d) {
		for (var i = 0; i < reqs_processed.length; ++i) {
			if (reqs_delete[d] == '-' + reqs_processed[i])
				reqs_processed[i] = "";

			if (reqs_processed[i][0] == '-')
				reqs_processed[i] = "";
		}
	}
	for (var i = 0; i < reqs_processed.length; ++i)
		if (reqs_processed[i] == requirement)
			isRequired = true;

	var reqs_string = reqs_processed.join(',');
	window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements = reqs_string;
	window["UHT_GAME_CONFIG_SRC"].brandRequirements = "";
	window["UHT_GAME_CONFIG"].jurisdictionRequirements = reqs_string;

	if (window["ServerOptions"] != undefined) {
		ServerOptions.jurisdictionRequirements = reqs_string;
		ServerOptions.brandRequirements = "";
	}
	return isRequired;
}

var timeoutPatchCurrency = null;

function PatchCurrency() {
	if (timeoutPatchCurrency != null)
		clearTimeout(timeoutPatchCurrency);
	if (window["CurrencyPatch"] == undefined) {
		timeoutPatchCurrency = setTimeout(PatchCurrency, 100);
		return;
	}
	var map = [{
		c: "BYN",
		s: "Br"
	}, {
		c: "PEN",
		s: "S/."
	}];
	var oICI = CurrencyPatch.prototype.InitCurrencyInfo;
	CurrencyPatch.prototype.InitCurrencyInfo = function () {
		for (var i = 0; i < map.length; i++)
			this.currencies[map[i].c + "sym"] = map[i].s;

		this.languageFormats["id_dsep"] = ".";
		this.languageFormats["id_dnum"] = "2";
		this.languageFormats["id_gsep"] = ",";
		this.languageFormats["id_gnum"] = "3";
		this.languageFormats["id_symp"] = "2";

		var ret = oICI.apply(this, arguments);
		if (["mnsn_m88"].indexOf(UHT_GAME_CONFIG.STYLENAME) > -1) {
			ret.CurrencySymbol = "";
			ret.CurrencyPositivePattern = 0;
			ret.CurrencyNegativePattern = 0;
		}
		return ret;
	}
}
PatchCurrency();



UHTPatch({
	name: "PatchGA",
	ready: function () {
		return (window["Tracking"] != undefined);
	},
	apply: function () {
		if (IsRequired("NOGA")) {
			window["globalTracking"].QueuedEvents = [];
			window["globalTracking"].QueuedTimers = [];
			window["globalTracking"].SendEvent = function () { };
			window["globalTracking"].SendTimer = function () { };
			window["globalTracking"].StopTimerAndSend = function () { };
			return;
		}

		var oT_SE = Tracking.prototype.SendEvent;
		Tracking.prototype.SendEvent = function () {
			if (["SoundEnabled",
				"ORIENTATION_MOBILE_time_portrait",
				"ORIENTATION_MOBILE_time_landscape",
				"ORIENTATION_MOBILE_initial_portrait",
				"ORIENTATION_MOBILE_initial_landscape",
				"SND_MOBILE_download_started",
				"SND_setBackToON"
			].indexOf(arguments[1]) != -1)
				return;

			if (arguments[3] == "SpinTracker")
				arguments[3] = "ST" + SPIN_TRACKER_ID;
			oT_SE.apply(this, arguments);
		}
		var oT_STAS = Tracking.prototype.StopTimerAndSend;
		Tracking.prototype.StopTimerAndSend = function () {
			var oLength = globalTracking.QueuedTimers.length;
			oT_STAS.apply(this, arguments);
			if ((arguments[2] == "SpinTracker") && globalTracking.QueuedTimers.length > oLength) {
				globalTracking.QueuedTimers[globalTracking.QueuedTimers.length - 1].type = "ST" + SPIN_TRACKER_ID;
			}
		}
	},
	retry: function () {
		return (window["Renderer"] == undefined);
	},
	interval: 10
});

var timeoutPatchTCU = null;

function PatchTCU() {
	if (timeoutPatchTCU != null)
		clearTimeout(timeoutPatchTCU);
	if (window["TournamentConnection"] == undefined) {
		timeoutPatchTCU = setTimeout(PatchTCU, 10);
		return;
	}
	var oTCU = TournamentConnection.prototype.Update;
	TournamentConnection.prototype.Update = function () {
		this.isRacePrizesReloaded = true;
		oTCU.apply(this, arguments)
	}
	if (window["LobbyConnection"] != undefined) {
		var oFP = LobbyConnection.prototype.FindPromotion;
		LobbyConnection.prototype.FindPromotion = function () {
			if (this.promoResponse == null)
				return null;
			return oFP.apply(this, arguments)
		}
	}

	if (window["LobbyCategoriesManager"] != undefined)
		LobbyCategoriesManager.prototype.FindLocalizedLabel = function ( /**string*/ name) {
			for (var i = 0; i < this.localizedLabels.length; ++i)
				if (this.localizedLabels[i].gameObject.name == name)
					return this.localizedLabels[i];

			return null;
		};
}
PatchTCU();

var timeoutPatchMCS_SQ = null;

function PatchMCS_SQ() {
	if (timeoutPatchMCS_SQ != null)
		clearTimeout(timeoutPatchMCS_SQ);
	if (window["MoneyCollectSequence_ScarabQueen"] == undefined) {
		timeoutPatchMCS_SQ = setTimeout(PatchMCS_SQ, 1000);
		return;
	}
	var oMCS_SQ = MoneyCollectSequence_ScarabQueen.prototype.PatchAndProcessData;
	MoneyCollectSequence_ScarabQueen.prototype.PatchAndProcessData = function () {
		if (XT.GetObject(Vars.RandomMysterySymbolId) == null)
			return;

		return oMCS_SQ.apply(this, arguments);
	}
}
PatchMCS_SQ();

var timeoutPatchSpinExciter = null;

function PatchSpinExciter() {
	if (timeoutPatchSpinExciter != null)
		clearTimeout(timeoutPatchSpinExciter);
	if (window["VS_SpinExciter"] == undefined) {
		timeoutPatchSpinExciter = setTimeout(PatchSpinExciter, 10);
		return;
	}
	var oSAOR = VS_SpinExciter.prototype.SymbolAppearencesOnReel;
	VS_SpinExciter.prototype.SymbolAppearencesOnReel = function (symbolId, reelidx) {
		this.symbolId = symbolId;
		return oSAOR.call(this, symbolId, reelidx);
	}
}
PatchSpinExciter();

var timeoutPatchCustomMessagesLabels = null;

function PatchCustomMessagesLabels() {
	if (timeoutPatchCustomMessagesLabels != null)
		clearTimeout(timeoutPatchCustomMessagesLabels);
	if (window["SystemMessageManager"] == undefined) {
		timeoutPatchCustomMessagesLabels = setTimeout(PatchCustomMessagesLabels, 10);
		return;
	}
	var oPT = SystemMessageManager.ProcessText;
	SystemMessageManager.ProcessText = function (text) {
		if (text != undefined)
			return oPT.call(this, text);
		else
			return text;
	}
}
PatchCustomMessagesLabels();

var timeoutPatchAGCC = null;

function PatchAGCC() // AND CHINESE SOUND FOR PROMOTIONS
{
	if (timeoutPatchAGCC != null)
		clearTimeout(timeoutPatchAGCC);

	var fixed = false;

	if (window["globalRuntime"] != undefined)
		if (window["globalRuntime"].sceneRoots.length > 0) {
			var paths = [
				"UI Root/LoaderParent/Loader/AGCC", //agcc
			]

			var roots = globalRuntime.sceneRoots;

			for (var r = 0; r < roots.length; ++r) {
				for (var i = 0; i < paths.length; ++i) {
					var t = roots[r].transform.Find(paths[i]);
					if (t != null) {
						t.gameObject.transform.localScale(0.85, 0.85, 0.85);
					}
				}
			}

			// CHINESE SOUND

			if (globalRuntime.sceneRoots.length > 1) {
				if (window["PromotionContentSwitcher"] != undefined) {
					var pcs = globalRuntime.sceneRoots[1].GetComponentsInChildren(PromotionContentSwitcher, true);
					for (var s = 0; s < pcs.length; s++) {
						var pc = pcs[s];
						for (var a = 0; a < pc.asiaContents.length; a++) {
							var asp = pc.asiaContents[a].GetComponent(SoundPlayer);
							if (asp != null && a < pc.europeContents.length) {
								var esp = pc.europeContents[a].GetComponent(SoundPlayer);
								if (esp != null)
									asp.audioClip = esp.audioClip;
							}
						}
					}
				}
				fixed = true; //move this outside when reverting - this must remain
			}
		}

	if (!fixed) {
		timeoutPatchAGCC = setTimeout(PatchAGCC, 10);
		return;
	}
}
PatchAGCC();

var timeoutPatchCFullscreen = null;

function PatchCFullscreen() {
	if (timeoutPatchCFullscreen != null)
		clearTimeout(timeoutPatchCFullscreen);

	if (window["screenfull"] != undefined) {
		var mustDisable = false;
		if (["pxlbt_pixelbetse", "pxlbt_pixelbet", "yb_yabo", "pxlbt_pixelbetde"].indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
			mustDisable = true;
		if ((window["UHT_GAME_CONFIG_SRC"] != undefined) && (UHT_GAME_CONFIG_SRC["integrationType"] == "BETWAY"))
			mustDisable = true;

		if (mustDisable) {
			//Disable for some
			window["screenfull"]["request"] = function (elem) { };
		} else {
			//Handle it simpler for all the rest - Not that simple, but works in Chrome < 71 also now
			window["screenfull"]["request"] = function (elem) {
				var info = UAParser2();
				if ((info.os.name == "iOS") || (info.os.name == "Mac OS"))
					return;
				var request = this.raw.requestFullscreen;
				elem = elem || document.documentElement;
				elem[request]({
					navigationUI: "hide"
				});
			}
		}
		return;
	}
	timeoutPatchCFullscreen = setTimeout(PatchCFullscreen, 10);
}
PatchCFullscreen();


var timeoutPatchFFSound = null;
var oCSR = null;

function PatchFFSound() {
	if (timeoutPatchFFSound != null)
		clearTimeout(timeoutPatchFFSound);
	if (window["createjs"] != undefined)
		if (window["createjs"]["Sound"] != undefined)
			if (window["createjs"]["Sound"]["registerPlugins"] != undefined) {
				oCSR = createjs.Sound.registerPlugins;
				createjs.Sound.registerPlugins = function (arg) {
					if (arg.length > 1)
						return oCSR(arg);
					return false;
				};
				return;
			}
	timeoutPatchFFSound = setTimeout(PatchFFSound, 10);
}
PatchFFSound();


var timeoutPatchXTVars = null;

function PatchXTVars() {
	if (timeoutPatchXTVars != null)
		clearTimeout(timeoutPatchXTVars);
	if (window["XT"] == undefined || window["UHT_GAME_CONFIG"] == undefined) {
		timeoutPatchXTVars = setTimeout(PatchXTVars, 10);
		return;
	}
	var oXTRAI = XT.RegisterAndInit;
	XT.RegisterAndInit = function (go) {
		oXTRAI.call(this, go);

		// Disable autoplay
		var DisableAutoplay = false;
		var stylenames = ["NYX939", "atg_atg"];
		if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
			DisableAutoplay = true;

		if (DisableAutoplay)
			if (Vars.Jurisdiction_DisableAutoplay != undefined)
				XT.SetBool(Vars.Jurisdiction_DisableAutoplay, true);

		// Instant autoplay
		var InstantAutoplay = false;
		if (UHT_GAME_CONFIG.STYLENAME == "_??????????????????????????????_")
			InstantAutoplay = true;

		if (InstantAutoplay)
			if (Vars.InstantAutoplay != undefined)
				XT.SetBool(Vars.InstantAutoplay, true);


	}
}
PatchXTVars();

var timeoutPatchCloseEvent = null;

function PatchCloseEvent() {
	if (timeoutPatchCloseEvent != null)
		clearTimeout(timeoutPatchCloseEvent);
	if (window["UHTInterfaceBOSS"] == undefined) {
		timeoutPatchCloseEvent = setTimeout(PatchCloseEvent, 100);
		return;
	}
	var oOBU = window.onbeforeunload;
	window.onbeforeunload = function () {
		var lastEventIndex = globalTracking.QueuedEvents.length - 1;
		var willSend = true;
		if (lastEventIndex > -1) {
			var lastEventAction = globalTracking.QueuedEvents[lastEventIndex].action;
			if (lastEventAction.indexOf("OpenedFromLobby_") != -1)
				willSend = false;
			if (lastEventAction.indexOf("OpenedFromMultiLobby_") != -1)
				willSend = false;
		}
		if (willSend)
			UHTInterfaceBOSS.PostMessage("notifyCloseContainer");
		oOBU.call(this);
	}
}
PatchCloseEvent();


var timeoutPatchZeroSizeScreen = null;

function PatchZeroSizeScreen() {
	if (timeoutPatchZeroSizeScreen != null)
		clearTimeout(timeoutPatchZeroSizeScreen);
	if (window["Camera"] == undefined) {
		timeoutPatchZeroSizeScreen = setTimeout(PatchZeroSizeScreen, 100);
		return;
	}
	var oCU = Camera.prototype.Update;
	Camera.prototype.Update = function () {
		if (UHTScreen.height == 0) UHTScreen.height = 1;
		if (UHTScreen.width == 0) UHTScreen.width = 1;
		oCU.call(this);
	}
}
PatchZeroSizeScreen();

var timeoutPatchEnableDesktopHomeButton = null;

function PatchEnableDesktopHomeButton() {
	if (timeoutPatchEnableDesktopHomeButton != null)
		clearTimeout(timeoutPatchEnableDesktopHomeButton);

	if (window["UHT_GAME_CONFIG"] == undefined) {
		timeoutPatchEnableDesktopHomeButton = setTimeout(PatchEnableDesktopHomeButton, 100);
		return;
	}
	var ShowHomeOnDesktop = false;
	var styleNameList = "sbod_sbotest,sbod_sbotry,sbod_sbobetvip,cer_casino999dk,cer_vikings".split(",");
	for (var i = 0; i < styleNameList.length; i++) {
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i]) {
			ShowHomeOnDesktop = true;
			break;
		}
	}

	if (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1)
		ShowHomeOnDesktop = true;

	if (IsRequired("HBD"))
		ShowHomeOnDesktop = true;

	if (!ShowHomeOnDesktop)
		return;

	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1)) {
		//SHOW HOME BUTTON
		var homePaths = [
			"UI Root/XTRoot/Root/GUI/Interface/Windows/MenuWindow/Content/Links/WithoutPromoUrl/Home", //show home button desktop WithoutPromoUrl
			"UI Root/XTRoot/Root/GUI/Interface/Windows/MenuWindow/Content/Links/WithPromoUrl/Home", //show home button desktop WithPromoUrl
		]

		for (var i = 0; i < homePaths.length; ++i) {
			var t = window["globalRuntime"].sceneRoots[1].transform.Find(homePaths[i]);
			if (t != null)
				t.gameObject.SetActive(true);
		}

	} else {
		timeoutPatchEnableDesktopHomeButton = setTimeout(PatchEnableDesktopHomeButton, 100);
	}
}
PatchEnableDesktopHomeButton();

var timeoutPatchHomeButtonDemoMode = null;

function PatchHomeButtonDemoMode() {
	if (timeoutPatchHomeButtonDemoMode != null)
		clearTimeout(timeoutPatchHomeButtonDemoMode);

	if (window["UHT_GAME_CONFIG"] == undefined) {
		timeoutPatchHomeButtonDemoMode = setTimeout(PatchHomeButtonDemoMode, 100);
		return;
	}

	var shouldPatch = false;
	if (window["UHT_GAME_CONFIG"]["demoMode"])
		shouldPatch = true;

	if (!shouldPatch)
		return;

	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1)) {
		var OnRequestToCloseGame = function () {
			window.parent.postMessage(JSON.stringify({
				action: 'omni-api.goTo',
				actionData: 'lobby'
			}), '*');
		}
		XT.RegisterCallbackEvent(Vars.Evt_ToServer_CloseGame, OnRequestToCloseGame, this);
	} else {
		timeoutPatchHomeButtonDemoMode = setTimeout(PatchHomeButtonDemoMode, 100);
	}
}
PatchHomeButtonDemoMode();

var timeoutPatchHidePPlogo = null;

function PatchHidePPlogo() {
	if (window["UHT_GAME_CONFIG"] == undefined) {
		timeoutPatchHidePPlogo = setTimeout(PatchHidePPlogo, 10);
		return;
	}
	var HideLogo = false;
	if (UHT_GAME_CONFIG.STYLENAME == "ebetgrp_ebet")
		HideLogo = true;

	if (UHT_GAME_CONFIG.STYLENAME == "vb-dafa")
		HideLogo = true;

	if (UHT_GAME_CONFIG.STYLENAME == "SBO")
		HideLogo = true;

	if (UHT_GAME_CONFIG.STYLENAME == "SB2")
		HideLogo = true;

	if (!HideLogo)
		return;

	if (timeoutPatchHidePPlogo != null)
		clearTimeout(timeoutPatchHidePPlogo);

	if (window["globalRuntime"] == undefined) {
		timeoutPatchHidePPlogo = setTimeout(PatchHidePPlogo, 10);
		return;
	}

	var paths = [
		"UI Root/XTRoot/Root/GUI/PragmaticPlayAnchor", //hide desktop tm
		"UI Root/XTRoot/Root/GUI_mobile/PragmaticPlayAnchor", //hide mobile tm
		"UI Root/LoaderParent/Loader/Logo", //hide client logo
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page2/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page4/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page6/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page8/Content/RealContent/CopyrightHolder", // hide QoG copyright

		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page2/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page4/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page6/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page8/Content/RealContent/CopyrightHolder", // hide QoG copyright

		"UI Root/XTRoot/Root/Paytable/Pages/Page1/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable/Pages/Page2/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable/Pages/Page3/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable/Pages/Page4/CopyrightHolder" // hide QoG copyright

	]

	var roots = globalRuntime.sceneRoots;

	for (var r = 0; r < roots.length; ++r) {
		for (var i = 0; i < paths.length; ++i) {
			var t = roots[r].transform.Find(paths[i]);
			if (t != null)
				t.gameObject.SetActive(false);
		}
	}

	if (globalRuntime.sceneRoots.length < 2) {
		timeoutPatchHidePPlogo = setTimeout(PatchHidePPlogo, 10);
	}
}
PatchHidePPlogo();

var timeoutPatchRCCloseParentWindowRedirect = null;

function PatchRCCloseParentWindowRedirect() {
	if (timeoutPatchRCCloseParentWindowRedirect != null)
		clearTimeout(timeoutPatchRCCloseParentWindowRedirect);

	if (window["UHT_GAME_CONFIG"] == undefined) {
		timeoutPatchRCCloseParentWindowRedirect = setTimeout(PatchRCCloseParentWindowRedirect, 100);
		return;
	}

	var shouldPatch = false;
	var styleNameList = "isb_stoiximanro-prod,isb_stoiximanpt-prod,isb_stoiximangr-lux-prod,isb_stoiximande-lux-prod,isb_stoiximanbr-lux-prod,isb_sbtech_prod,isb_sbtech_prod-uk".split(",");
	for (var i = 0; i < styleNameList.length; i++) {
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i]) {
			shouldPatch = true;
			break;
		}
	}

	if (!shouldPatch)
		return;

	if (window["SystemMessageManager"] == undefined) {
		timeoutPatchRCCloseParentWindowRedirect = setTimeout(PatchRCCloseParentWindowRedirect, 100);
		return;
	}

	SystemMessageManager.RCClose = function () {
		if (RCCloseURL != undefined) {
			if (RCCloseURL_Type == "notify") {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", RCCloseURL, true);
				xhr.send(null);

				UHTEventBroker.Trigger(UHTEventBroker.Type.Adapter, JSON.stringify({
					common: "EVT_CLOSE_GAME",
					args: null
				}));
			} else
				window.top.location.href = RCCloseURL;
		} else
			UHTEventBroker.Trigger(UHTEventBroker.Type.Adapter, JSON.stringify({
				common: "EVT_CLOSE_GAME",
				args: null
			}));
	};
}
PatchRCCloseParentWindowRedirect();

var timeoutPatchPlayNowButton = null;

function PatchPlayNowButton() {
	if (timeoutPatchPlayNowButton != null)
		clearTimeout(timeoutPatchPlayNowButton);

	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1)) {
		if (window["TournamentSimpleOptIn"] == undefined)
			return;

		var tSOI = globalRuntime.sceneRoots[1].GetComponentsInChildren(TournamentSimpleOptIn, true)[0];
		tSOI.RemoveButtonAndPatchText = function () {
			this.disableOptOut.Start();
			var roots = globalRuntime.sceneRoots;
			for (var i = 0; i < roots.length; i++)
				if (Globals.isMini) {
					var joinNowLabel = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/Window/Bottom/Buttons/OptInLabel");
					if (joinNowLabel != null) {
						var label = joinNowLabel.transform.GetComponentsInChildren(UILabel, true)[0];
						var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/NoMoneyWindow/Button/NoMoneyButtonLabel");
						if (okLabelTransform != null) {
							var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
							label.text = okLabel.text;
						}
					}
					var buttonsParent = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/Window/Bottom/Buttons");
					if (buttonsParent != null) {
						var multipleLabelAnchor = buttonsParent.transform.GetComponentsInChildren(MultipleLabelAnchor, true)[0];
						multipleLabelAnchor.ignoreInactiveLabels = true
					}
				} else if (Globals.isMobile) {
					var joinNowLabelLand = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/Buttons/JoinNowLabel");
					if (joinNowLabelLand != null) {
						var label = joinNowLabelLand.transform.GetComponentsInChildren(UILabel, true)[0];
						var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Land/CloseButton/OkLabel");
						if (okLabelTransform != null) {
							var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
							label.text = okLabel.text;
						}
					}

					var joinNowLabelPort = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/Buttons/OptIn/JoinNowLabel");
					if (joinNowLabelPort != null) {
						var label = joinNowLabelPort.transform.GetComponentsInChildren(UILabel, true)[0];
						var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Port/CloseButton/OkLabel");
						if (okLabelTransform != null) {
							var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
							label.text = okLabel.text;
						}
					}

					var optInParent = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/Buttons/OptIn");
					if (optInParent != null) {
						var pos = optInParent.transform.localPosition();
						optInParent.transform.localPosition(pos.x, pos.y - 120, pos.z);
						var label = optInParent.transform.GetComponentsInChildren(UILabel, true)[0];
					}
				} else {
					var joinNowLabel = roots[i].transform.Find("UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/Buttons/JoinNowLabel");
					if (joinNowLabel != null) {
						var label = joinNowLabel.transform.GetComponentsInChildren(UILabel, true)[0];
						var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI/QuickSpinAnimator/QuickSpin/Window/Content/CloseButton/OkLabel");
						if (okLabelTransform != null) {
							var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
							label.text = okLabel.text;
						}
					}
				}
		}
	} else {
		timeoutPatchPlayNowButton = setTimeout(PatchPlayNowButton, 100);
	}
}
PatchPlayNowButton();

var timeoutPatchSpinButtonColliderDesktop = null;

function PatchSpinButtonColliderDesktop() {
	if (timeoutPatchSpinButtonColliderDesktop != null)
		clearTimeout(timeoutPatchSpinButtonColliderDesktop);

	var fixed = false;

	if (window["globalRuntime"] != undefined) {
		if (window["globalRuntime"].sceneRoots.length > 0) {
			if (Globals.isMobile)
				return;

			var paths = [
				"UI Root/XTRoot/Root/GUI/Interface/TopBar/RightGroup/SpinButtons/StartSpin_Button",
				"UI Root/XTRoot/Root/GUI/Interface/TopBar/RightGroup/SpinButtons/StopSpin_Button"
			]

			var roots = globalRuntime.sceneRoots;

			for (var r = 0; r < roots.length; ++r) {
				for (var i = 0; i < paths.length; ++i) {
					var t = roots[r].transform.Find(paths[i]);
					if (t != null) {
						var collider = t.GetComponentsInChildren(Collider, true)[0];
						if (collider != null) {
							collider.size.x = 80;
							collider.size.y = 80;
							collider.transform.SetAllDirtyUserFlags();
							fixed = true;
						}
					}
				}
			}
		}
	}

	if (!fixed) {
		timeoutPatchSpinButtonColliderDesktop = setTimeout(PatchSpinButtonColliderDesktop, 100);
		return;
	}
}
PatchSpinButtonColliderDesktop();

var timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers = null;

function FRBWrongTotalBetWhenMultipleBetLevelsMultipliers() {
	if (timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers != null)
		clearTimeout(timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers);

	var fixed = false;

	if (window["BonusRoundsController"] != undefined) {
		if (UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs20fruitsw") == -1 && UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs20sbxmas") == -1 && UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vswaysrhino") == -1) {
			BonusRoundsController.SetLines = function (lines) {
				XT.SetInt(Vars.BetToTotalBetMultiplier, lines);
				XT.SetInt(Vars.Lines, XT.GetBool(Vars.GameHasWaysInsteadOfLines) ? XT.GetInt(Vars.TotalNumberOfLines) : lines);
			}
		}
		fixed = true;
	}

	if (!fixed) {
		timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers = setTimeout(FRBWrongTotalBetWhenMultipleBetLevelsMultipliers, 100);
		return;
	}
}
FRBWrongTotalBetWhenMultipleBetLevelsMultipliers();

var timeoutPatchiOSLabelMultipleLayers = null;

function PatchiOSLabelMultipleLayers() {
	if (timeoutPatchiOSLabelMultipleLayers != null)
		clearTimeout(timeoutPatchiOSLabelMultipleLayers);

	if (window["LabelMultipleLayers"] == undefined) {
		timeoutPatchiOSLabelMultipleLayers = setTimeout(PatchiOSLabelMultipleLayers, 100);
		return;
	}

	if ((window["safari"] != undefined) || (document.documentElement.className.indexOf("iOS") >= 0 && document.documentElement.className.indexOf("MobileSafari") >= 0)) {
		var oLM_UT = LabelMultipleLayers.prototype.UpdateText;
		LabelMultipleLayers.prototype.UpdateText = function () {
			navigator.isCocoonJS = true;
			var oldWindowSafari = window["safari"];
			window["safari"] = {};
			oLM_UT.apply(this, arguments);
			navigator.isCocoonJS = false;
			window["safari"] = oldWindowSafari;
		}
	}
}
PatchiOSLabelMultipleLayers();

var timeoutPatchiOSStandaloneDisableFullscreen = null;

function PatchiOSStandaloneDisableFullscreen() {
	if (timeoutPatchiOSStandaloneDisableFullscreen != null)
		clearTimeout(timeoutPatchiOSStandaloneDisableFullscreen);

	if (window["IPhone8Helper"] == undefined || window["UHT_GAME_CONFIG"] == undefined) {
		timeoutPatchiOSStandaloneDisableFullscreen = setTimeout(PatchiOSStandaloneDisableFullscreen, 100);
		return;
	}

	var shouldDisable = false;
	var styleNameList = "isb,isb_netbetit-prod,isb_netbetcouk-prod,isb_netbetro-prod,1xbet,betb2b_betandyou,betb2b_fansportcom,betb2b_retivabet,betb2b_allnewgclub,betb2b_astekbet,betb2b_betwinner,betb2b_casinoz,betb2b_dbbet,betb2b_megapari,betb2b_oppabet,betb2b_gyzylburgutbet,betb2b_sapphirebet,betb2b_melbet,betb2b_play595,1xbet_1xbit,betb2b_aznbet,1xbet_sw,betb2b_sprutcasino,betb2b_1xslot,betb2b_22bet".split(",");
	for (var i = 0; i < styleNameList.length; i++) {
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i]) {
			shouldDisable = true;
			break;
		}
	}

	if (navigator.standalone || shouldDisable) {
		IPhone8Helper.prototype.GameStarted = function () {
			return false
		};
	}
}
PatchiOSStandaloneDisableFullscreen();

var timeoutPatchDisableTurboSpin = null;

function PatchDisableTurboSpin() {
	if (timeoutPatchDisableTurboSpin != null)
		clearTimeout(timeoutPatchDisableTurboSpin);

	if (window["UHT_GAME_CONFIG"] == undefined) {
		timeoutPatchDisableTurboSpin = setTimeout(PatchDisableTurboSpin, 100);
		return;
	}

	var shouldDisable = false;
	var styleNameList = "iforium_williamhill,iforium_willhilles,iforium_williamhilles,iforium,NYX1287,NYX897".split(",");
	for (var i = 0; i < styleNameList.length; i++) {
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i]) {
			shouldDisable = true;
			break;
		}
	}
	if (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1)
		shouldDisable = true;

	if (UHT_GAME_CONFIG.GAME_SYMBOL != undefined && UHT_GAME_CONFIG.GAME_SYMBOL.substr(0, 2) != "vs")
		return;

	if (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"] || ServerOptions.jurisdiction == null) {
		timeoutPatchDisableTurboSpin = setTimeout(PatchDisableTurboSpin, 100);
		return;
	}

	if (IsRequired("NOTS"))
		shouldDisable = true;

	if (!shouldDisable)
		return;

	var OnXTContinuousSpinChanged = function ( /**boolean*/ isContinuousSpin) {
		if (isContinuousSpin)
			XT.SetBool(Vars.ContinuousSpin, false);
	};

	var OnXTGameInit = function () {
		if (Globals.isMobile) {
			var autoplay = window["AutoplayControllerMobile"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobile, true) : [];
			for (var i = 0; i < autoplay.length; ++i) {
				var turboSpin = autoplay[i].transform.Find("Content/Checkboxes/TurboSpin");
				if (turboSpin != null)
					turboSpin.gameObject.SetActive(false);
			}

			var interfaces = window["InterfaceControllerMobile_1"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(InterfaceControllerMobile_1, true) : [];
			for (var i = 0; i < interfaces.length; ++i) {
				var holdForTurbo = interfaces[i].transform.Find("ContentInterface/DynamicContent/AnchoredRight/Normal/SpinButtons/StartSpin_Button/HoldToAutoplay");
				if (holdForTurbo != null)
					holdForTurbo.gameObject.SetActive(false);
			}

			interfaces = window["InterfaceControllerMobile_2"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(InterfaceControllerMobile_2, true) : [];
			for (var i = 0; i < interfaces.length; ++i) {
				var holdForTurbo = interfaces[i].transform.Find("ContentInterface/DynamicContent/ContentScale/Normal/SpinButtons/StartSpin_Button/HoldToAutoplay");
				if (holdForTurbo != null)
					holdForTurbo.gameObject.SetActive(false);
			}
		} else {
			var autoplay = window["AutoplayControllerMobile"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobile, true) : [];
			for (var i = 0; i < autoplay.length; ++i) {
				var turboSpin = autoplay[i].transform.Find("Content/Checkboxes/TurboSpin");
				if (turboSpin != null)
					turboSpin.gameObject.SetActive(false);
			}
		}

		var advancedAutoplay = window["AutoplayControllerAdvanced"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerAdvanced, true) : [];
		for (var i = 0; i < advancedAutoplay.length; ++i) {
			var turboSpin = advancedAutoplay[i].transform.Find("Checkboxes/TurboSpin");
			if (turboSpin != null)
				turboSpin.gameObject.SetActive(false);

			turboSpin = advancedAutoplay[i].transform.Find("Clipped/Content/Checkboxes/TurboSpin");
			if (turboSpin != null)
				turboSpin.gameObject.SetActive(false);
		}

		var quickSpinWindow = window["QuickSpinWindowController"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(QuickSpinWindowController, true) : [];
		for (var i = 0; i < quickSpinWindow.length; ++i)
			quickSpinWindow[i].disableWindow.Start();
	};

	var OnXTContinuousSpinChanged = function ( /**boolean*/ isContinuousSpin) {
		if (isContinuousSpin)
			XT.SetBool(Vars.ContinuousSpin, false);
	};

	XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this);
	XT.RegisterCallbackBool(Vars.ContinuousSpin, OnXTContinuousSpinChanged, this);
	if (!Globals.isMobile) {
		if (window["GUIMessageTurboSpin"] != undefined)
			GUIMessageTurboSpin.prototype.Show = function () {
				if (this.messages != null && this.messages.length > 0) {
					var i = Random.Range(0, this.messages.length);
					this.label.text = this.messages[i];
				}

				this.gameObject.SetActive(true);
			};
	}
}
PatchDisableTurboSpin();

var timeoutDisableHomeButtonMiniMode = null;

function DisableHomeButtonMiniMode() {
	if (timeoutDisableHomeButtonMiniMode != null)
		clearTimeout(timeoutDisableHomeButtonMiniMode);

	if (window["UHT_GAME_CONFIG"] == undefined) {
		timeoutDisableHomeButtonMiniMode = setTimeout(DisableHomeButtonMiniMode, 100);
		return;
	}

	var shouldDisable = false;
	var styleNameList = "mnsn_m88,mnsn_happy8,mnsn_happy8stg,mnsn_m88stg,mnsn_happy8rc,mnsn_m88rc".split(",");
	for (var i = 0; i < styleNameList.length; i++) {
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i]) {
			shouldDisable = true;
			break;
		}
	}
	if (UHT_GAME_CONFIG.STYLENAME.indexOf("weinet_") > -1)
		shouldDisable = true;

	if (IsRequired("NOHBMINI"))
		shouldDisable = true;

	if (!shouldDisable)
		return;

	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1)) {
		if (Globals.isMini) {
			var homeButtonPath = "UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/MenuWindow/Content/Home";
			var gameRoot = globalRuntime.sceneRoots[1];

			var t = gameRoot.transform.Find(homeButtonPath);
			if (t != null)
				t.gameObject.SetActive(false);
			XT.SetBool(Vars.Jurisdiction_GameLobbyInfoVisible, false);
		}
	} else {
		timeoutDisableHomeButtonMiniMode = setTimeout(DisableHomeButtonMiniMode, 100);
	}
}
DisableHomeButtonMiniMode();

var timeoutPatchMBUV = null;

function PatchMBUV() {
	if (timeoutPatchMBUV != null)
		clearTimeout(timeoutPatchMBUV);

	if (window["MenuButton"] == undefined) {
		timeoutPatchMBUV = setTimeout(PatchMBUV, 100);
		return;
	}
	MenuButton.prototype.UpdateValue = function (uil, uis) {
		this.label.text = uil.text;
		this.label.fontName = uil.fontName;
		this.label.Prepare();
		GUIArranger.I.CopySprite(uis, this.icon);
		GUIArranger.I.CopySpriteSize(uis, this.icon);
		var uibuttons = this.button.gameObject.GetComponents(UIButton);
		for (var i = 0; i < uibuttons.length; i++)
			if (uibuttons[i].target == this.icon)
				uibuttons[i].normal = uis.spriteName
	}


}
PatchMBUV();