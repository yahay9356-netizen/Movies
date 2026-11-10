import 'dart:convert';
import 'package:http/http.dart' as http;

class CastMember {
  final String name;
  final String character;
  final String avatar;

  CastMember({
    required this.name,
    required this.character,
    required this.avatar,
  });

  factory CastMember.fromJson(Map<String, dynamic> json) {
    return CastMember(
      name: json['name'] ?? '',
      character: json['character_name'] ?? 'Cast',
      avatar: json['url_small_image'] ?? '',
    );
  }
}

class Movie {
  final String id;
  final String title;
  final int year;
  final double rating;
  final int duration;
  final int likes;
  final List<String> genres;
  final String poster;
  final List<String> screenshots;
  final String summary;
  final String? trailerCode;
  final List<CastMember> cast;

  Movie({
    required this.id,
    required this.title,
    required this.year,
    required this.rating,
    required this.duration,
    required this.likes,
    required this.genres,
    required this.poster,
    required this.screenshots,
    this.summary = '',
    this.trailerCode,
    this.cast = const [],
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    final shots = <String>[
      if (json['large_screenshot_image1'] != null) json['large_screenshot_image1'],
      if (json['large_screenshot_image2'] != null) json['large_screenshot_image2'],
      if (json['large_screenshot_image3'] != null) json['large_screenshot_image3'],
    ];

    final castList = (json['cast'] as List<dynamic>? ?? [])
        .map((e) => CastMember.fromJson(e as Map<String, dynamic>))
        .toList();

    return Movie(
      id: '${json['id']}',
      title: json['title'] ?? '',
      year: json['year'] ?? 2022,
      rating: (json['rating'] as num?)?.toDouble() ?? 7.5,
      duration: json['runtime'] ?? 120,
      likes: json['like_count'] ?? 15,
      genres: List<String>.from(json['genres'] ?? ['Action']),
      poster: json['large_cover_image'] ?? json['medium_cover_image'] ?? '',
      screenshots: shots,
      summary: json['description_full'] ?? json['summary'] ?? '',
      trailerCode: json['yt_trailer_code'],
      cast: castList,
    );
  }
}

class YtsApiService {
  static const String baseUrl = 'https://yts.gg/api/v2';

  static Future<List<Movie>> fetchMovies({String? query, String? genre, int limit = 20}) async {
    final params = <String, String>{'limit': '$limit'};
    if (query != null && query.isNotEmpty) params['query_term'] = query;
    if (genre != null && genre != 'All') params['genre'] = genre.toLowerCase();

    final uri = Uri.parse('$baseUrl/list_movies.json').replace(queryParameters: params);
    final res = await http.get(uri);
    if (res.statusCode != 200) throw Exception('Failed to load movies');

    final data = jsonDecode(res.body)['data']['movies'] as List<dynamic>? ?? [];
    return data.map((e) => Movie.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<Movie?> fetchMovieDetails(String movieId) async {
    final uri = Uri.parse('$baseUrl/movie_details.json').replace(queryParameters: {
      'movie_id': movieId,
      'with_images': 'true',
      'with_cast': 'true',
    });
    final res = await http.get(uri);
    if (res.statusCode != 200) return null;

    final movieJson = jsonDecode(res.body)['data']['movie'];
    return movieJson != null ? Movie.fromJson(movieJson as Map<String, dynamic>) : null;
  }

  static Future<List<Movie>> fetchSimilarMovies(String movieId) async {
    final uri = Uri.parse('$baseUrl/movie_suggestions.json').replace(queryParameters: {
      'movie_id': movieId,
    });
    final res = await http.get(uri);
    if (res.statusCode != 200) return [];

    final data = jsonDecode(res.body)['data']['movies'] as List<dynamic>? ?? [];
    return data.map((e) => Movie.fromJson(e as Map<String, dynamic>)).toList();
  }
}
